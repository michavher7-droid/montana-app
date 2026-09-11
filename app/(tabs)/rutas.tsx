import * as DocumentPicker from 'expo-document-picker';
import * as Location from 'expo-location';
import { XMLParser } from 'fast-xml-parser';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import MapView, { MapType, Polyline, UrlTile } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Coordinate {
  latitude: number;
  longitude: number;
}

export default function RutasScreen() {
  const [activeTab, setActiveTab] = useState<'mapa' | 'itinerario'>('mapa');
  const [customLayer, setCustomLayer] = useState<'vectorial' | 'topografico' | 'satelite'>('topografico');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [gpxFileName, setGpxFileName] = useState<string | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<Coordinate[]>([]);
  const [routeDistance, setRouteDistance] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
      }
    })();
  }, []);

  // Función para calcular distancia aproximada en km entre coordenadas
  const calculateDistance = (pts: Coordinate[]) => {
    let totalMeters = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const R = 6371e3; // Radio de la Tierra en metros
      const φ1 = (p1.latitude * Math.PI) / 180;
      const φ2 = (p2.latitude * Math.PI) / 180;
      const Δφ = ((p2.latitude - p1.latitude) * Math.PI) / 180;
      const Δλ = ((p2.longitude - p1.longitude) * Math.PI) / 180;

      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      totalMeters += R * c;
    }
    return (totalMeters / 1000).toFixed(2);
  };

  // Importar y parsear archivo GPX
  const pickGPXFile = async () => {
    setMenuVisible(false);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setGpxFileName(file.name);

        const response = await fetch(file.uri);
        const fileContent = await response.text();

        const parser = new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: '@_',
        });
        const jsonObj = parser.parse(fileContent);

        let points: Coordinate[] = [];

        if (jsonObj?.gpx?.trk) {
          const tracks = Array.isArray(jsonObj.gpx.trk) ? jsonObj.gpx.trk : [jsonObj.gpx.trk];
          tracks.forEach((trk: any) => {
            if (trk?.trkseg) {
              const segments = Array.isArray(trk.trkseg) ? trk.trkseg : [trk.trkseg];
              segments.forEach((seg: any) => {
                if (seg?.trkpt) {
                  const trkpts = Array.isArray(seg.trkpt) ? seg.trkpt : [seg.trkpt];
                  trkpts.forEach((pt: any) => {
                    const lat = parseFloat(pt['@_lat']);
                    const lon = parseFloat(pt['@_lon']);
                    if (!isNaN(lat) && !isNaN(lon)) {
                      points.push({ latitude: lat, longitude: lon });
                    }
                  });
                }
              });
            }
          });
        }

        if (points.length === 0 && jsonObj?.gpx?.rte) {
          const routes = Array.isArray(jsonObj.gpx.rte) ? jsonObj.gpx.rte : [jsonObj.gpx.rte];
          routes.forEach((rte: any) => {
            if (rte?.rtept) {
              const rtepts = Array.isArray(rte.rtept) ? rte.rtept : [rte.rtept];
              rtepts.forEach((pt: any) => {
                const lat = parseFloat(pt['@_lat']);
                const lon = parseFloat(pt['@_lon']);
                if (!isNaN(lat) && !isNaN(lon)) {
                  points.push({ latitude: lat, longitude: lon });
                }
              });
            }
          });
        }

        if (points.length > 0) {
          setRouteCoordinates(points);
          const dist = calculateDistance(points);
          setRouteDistance(dist);

          Alert.alert('Ruta Importada', `Cargados ${points.length} puntos. Distancia: ${dist} km.`);

          setTimeout(() => {
            if (mapRef.current) {
              mapRef.current.fitToCoordinates(points, {
                edgePadding: { top: 80, right: 80, bottom: 140, left: 80 },
                animated: true,
              });
            }
          }, 300);
        } else {
          Alert.alert('Aviso', 'El archivo GPX no contiene un track válido.');
        }
      }
    } catch (err: any) {
      Alert.alert('Error', 'No se pudo leer el archivo GPX.');
    }
  };

  const clearRoute = () => {
    setRouteCoordinates([]);
    setGpxFileName(null);
    setRouteDistance(null);
    setMenuVisible(false);
  };

  const goToMyLocation = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );
    } else {
      Alert.alert('Ubicación', 'Obteniendo coordenadas GPS actuales...');
    }
  };

  const zoomIn = async () => {
    if (mapRef.current) {
      const camera = await mapRef.current.getCamera();
      camera.zoom = (camera.zoom || 15) + 1;
      mapRef.current.animateCamera(camera, { duration: 300 });
    }
  };

  const zoomOut = async () => {
    if (mapRef.current) {
      const camera = await mapRef.current.getCamera();
      camera.zoom = (camera.zoom || 15) - 1;
      mapRef.current.animateCamera(camera, { duration: 300 });
    }
  };

  const resetHeading = async () => {
    if (mapRef.current) {
      const camera = await mapRef.current.getCamera();
      camera.heading = 0;
      mapRef.current.animateCamera(camera, { duration: 500 });
    }
  };

  const initialRegion = {
    latitude: location ? location.coords.latitude : 20.6767,
    longitude: location ? location.coords.longitude : -103.3475,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const getNativeMapType = (): MapType => {
    if (customLayer === 'satelite') return 'satellite';
    return 'standard';
  };

  return (
    <SafeAreaView style={styles.container}>
      {activeTab === 'mapa' ? (
        <View style={styles.mapContainer}>
          <MapView
  ref={mapRef}
  style={styles.map}
  mapType="none"
  initialRegion={initialRegion}
  showsUserLocation={true}
  showsMyLocationButton={false}
  showsCompass={false}
>
  {/* Capa 1: Vectorial (Google Maps Standard sin API Key) */}
  {customLayer === 'vectorial' && (
    <UrlTile
      urlTemplate="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
      maximumZ={20}
      tileSize={256}
      zIndex={1}
    />
  )}

  {/* Capa 2: Topográfico (OpenTopoMap) */}
  {customLayer === 'topografico' && (
    <UrlTile
      urlTemplate="https://a.tile.opentopomap.org/{z}/{x}/{y}.png"
      maximumZ={17}
      tileSize={256}
      doubleTileSize={true}
      zIndex={1}
    />
  )}

  {/* Capa 3: Ortofoto / Satélite HD actualizada (Google Hybrid Tiles) */}
  {customLayer === 'satelite' && (
    <UrlTile
      urlTemplate="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
      maximumZ={20}
      tileSize={256}
      zIndex={1}
    />
  )}
  {/* Dibujar la línea de la ruta GPX cargada */}
        {routeCoordinates && routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#00E5FF"
            strokeWidth={5}
            zIndex={99}
          />
        )}
</MapView>

          {/* Badge de Ruta Activa */}
          {gpxFileName && (
            <View style={styles.routeBadge}>
              <Text style={styles.routeBadgeText}>📍 {gpxFileName}</Text>
              {routeDistance && (
                <Text style={styles.routeDistanceText}>📏 {routeDistance} km</Text>
              )}
            </View>
          )}

          {/* Botón Menú */}
          <TouchableOpacity
            style={styles.hamburgerButton}
            onPress={() => setMenuVisible(true)}>
            <Text style={styles.hamburgerIcon}>☰</Text>
          </TouchableOpacity>

          {/* Controles del Mapa */}
          <View style={styles.controlsCluster}>
            <TouchableOpacity style={styles.controlBtn} onPress={resetHeading}>
              <Text style={styles.controlText}>🧭</Text>
            </TouchableOpacity>

            <View style={styles.zoomGroup}>
              <TouchableOpacity style={styles.zoomBtnTop} onPress={zoomIn}>
                <Text style={styles.zoomText}>+</Text>
              </TouchableOpacity>
              <View style={styles.controlDivider} />
              <TouchableOpacity style={styles.zoomBtnBottom} onPress={zoomOut}>
                <Text style={styles.zoomText}>−</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={[styles.controlBtn, styles.locationBtn]} onPress={goToMyLocation}>
              <Text style={styles.controlText}>🎯</Text>
            </TouchableOpacity>
          </View>

          {/* Modal Menú */}
          <Modal
            transparent={true}
            visible={menuVisible}
            animationType="fade"
            onRequestClose={() => setMenuVisible(false)}>
            <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
              <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback>
                  <View style={styles.menuContainer}>
                    <Text style={styles.menuTitle}>Herramientas de Ruta</Text>
                    
                    <TouchableOpacity style={styles.importMenuBtn} onPress={pickGPXFile}>
                      <Text style={styles.importMenuText}>📂 Importar GPX</Text>
                    </TouchableOpacity>

                    {routeCoordinates.length > 0 && (
                      <TouchableOpacity style={styles.clearMenuBtn} onPress={clearRoute}>
                        <Text style={styles.clearMenuText}>🗑️ Limpiar Ruta</Text>
                      </TouchableOpacity>
                    )}

                    <View style={styles.divider} />

                    <Text style={styles.menuSubtitle}>Capa del mapa</Text>
                    
                    <TouchableOpacity
                      style={[
                        styles.menuOption,
                        customLayer === 'vectorial' && styles.menuOptionActive,
                      ]}
                      onPress={() => {
                        setCustomLayer('vectorial');
                        setMenuVisible(false);
                      }}>
                      <Text style={styles.menuOptionText}>🗺️ Vectorial</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.menuOption,
                        customLayer === 'topografico' && styles.menuOptionActive,
                      ]}
                      onPress={() => {
                        setCustomLayer('topografico');
                        setMenuVisible(false);
                      }}>
                      <Text style={styles.menuOptionText}>⛰️ Topográfico</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.menuOption,
                        customLayer === 'satelite' && styles.menuOptionActive,
                      ]}
                      onPress={() => {
                        setCustomLayer('satelite');
                        setMenuVisible(false);
                      }}>
                      <Text style={styles.menuOptionText}>🛰️ Ortofoto</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </View>
      ) : (
        /* VISTA 2: FICHA TÉCNICA E ITINERARIO */
        <ScrollView contentContainerStyle={styles.detailsContent}>
          <Text style={styles.routeTitle}>
            {gpxFileName ? `🏔️ ${gpxFileName.replace('.gpx', '')}` : '🏔️ Sin Ruta Cargada'}
          </Text>
          <Text style={styles.routeSubtitle}>
            Ficha técnica de la expedición e itinerario de paso.
          </Text>

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Distancia Total</Text>
              <Text style={styles.statValue}>
                {routeDistance ? `${routeDistance} km` : '--'}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Puntos de Control</Text>
              <Text style={styles.statValue}>
                {routeCoordinates.length > 0 ? routeCoordinates.length : '--'}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Dificultad</Text>
              <Text style={styles.statValue}>Moderada</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Estado</Text>
              <Text style={styles.statValue}>
                {routeCoordinates.length > 0 ? 'Lista' : 'Pendiente'}
              </Text>
            </View>
          </View>

          <Text style={styles.sectionHeader}>⏰ Itinerario de Salida</Text>

          <View style={styles.timelineItem}>
            <Text style={styles.timeText}>05:00 AM</Text>
            <View style={styles.timelineBody}>
              <Text style={styles.timelineTitle}>Punto de Encuentro & Check</Text>
              <Text style={styles.timelineDesc}>
                Revisión de equipo individual y charla de seguridad.
              </Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <Text style={styles.timeText}>07:00 AM</Text>
            <View style={styles.timelineBody}>
              <Text style={styles.timelineTitle}>Inicio de Ascenso</Text>
              <Text style={styles.timelineDesc}>
                Inicio de caminata a ritmo constante (3 km/h).
              </Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <Text style={styles.timeText}>11:30 AM</Text>
            <View style={styles.timelineBody}>
              <Text style={styles.timelineTitle}>Cumbre / Punto Máximo</Text>
              <Text style={styles.timelineDesc}>
                Hidratación, fotos y evaluación de clima para descenso.
              </Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <Text style={styles.timeText}>03:00 PM</Text>
            <View style={styles.timelineBody}>
              <Text style={styles.timelineTitle}>Retorno a Vehículos</Text>
              <Text style={styles.timelineDesc}>
                Cierre de expedición y conteo de participantes.
              </Text>
            </View>
          </View>
        </ScrollView>
      )}

      {/* Selector Flotante Inferior */}
      <View style={styles.bottomTabContainer}>
        <View style={styles.tabSelector}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'mapa' && styles.tabButtonActive]}
            onPress={() => setActiveTab('mapa')}>
            <Text style={[styles.tabText, activeTab === 'mapa' && styles.tabTextActive]}>
              🗺️ Mapa & GPX
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'itinerario' && styles.tabButtonActive]}
            onPress={() => setActiveTab('itinerario')}>
            <Text style={[styles.tabText, activeTab === 'itinerario' && styles.tabTextActive]}>
              📋 Ficha & Itinerario
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  bottomTabContainer: {
    position: 'absolute',
    bottom: 16,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    borderRadius: 25,
    padding: 4,
    borderWidth: 1,
    borderColor: '#334155',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: 'center',
    borderRadius: 20,
  },
  tabButtonActive: {
    backgroundColor: '#38BDF8',
  },
  tabText: {
    color: '#94A3B8',
    fontWeight: 'bold',
    fontSize: 12,
  },
  tabTextActive: {
    color: '#0F172A',
  },
  routeBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  routeBadgeText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: 'bold',
  },
  routeDistanceText: {
    color: '#F8FAFC',
    fontSize: 11,
    marginTop: 2,
  },
  hamburgerButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#1E293B',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    elevation: 4,
  },
  hamburgerIcon: {
    color: '#38BDF8',
    fontSize: 22,
    fontWeight: 'bold',
  },
  controlsCluster: {
    position: 'absolute',
    right: 16,
    bottom: 80,
    alignItems: 'center',
    gap: 10,
  },
  controlBtn: {
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    elevation: 4,
  },
  locationBtn: {
    borderColor: '#0284C7',
  },
  controlText: {
    fontSize: 18,
  },
  zoomGroup: {
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#334155',
    width: 42,
    elevation: 4,
  },
  zoomBtnTop: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomBtnBottom: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomText: {
    color: '#38BDF8',
    fontSize: 20,
    fontWeight: 'bold',
  },
  controlDivider: {
    height: 1,
    backgroundColor: '#334155',
    marginHorizontal: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 70,
    paddingRight: 16,
  },
  menuContainer: {
    width: 210,
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    elevation: 5,
  },
  menuTitle: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  importMenuBtn: {
    backgroundColor: '#0284C7',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 6,
  },
  importMenuText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  clearMenuBtn: {
    backgroundColor: '#EF4444',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 6,
  },
  clearMenuText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 6,
  },
  menuSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginTop: 4,
    marginBottom: 6,
  },
  menuOption: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginVertical: 2,
  },
  menuOptionActive: {
    backgroundColor: '#334155',
  },
  menuOptionText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '500',
  },
  detailsContent: {
    padding: 16,
    paddingBottom: 90,
  },
  routeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  routeSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  statBox: {
    width: '48%',
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statLabel: {
    fontSize: 11,
    color: '#94A3B8',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#38BDF8',
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 12,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 14,
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#38BDF8',
  },
  timeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#38BDF8',
    width: 70,
  },
  timelineBody: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  timelineDesc: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
});