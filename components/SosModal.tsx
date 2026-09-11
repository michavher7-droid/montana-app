import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface SosModalProps {
  visible: boolean;
  onClose: () => void;
}

function SosModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lon: number; alt: number | null } | null>(null);

  // Obtener la ubicación GPS precisa en tiempo real
  const obtenerUbicacion = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se requiere acceso al GPS para obtener tus coordenadas de emergencia.');
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setCoords({
        lat: location.coords.latitude,
        lon: location.coords.longitude,
        alt: location.coords.altitude ? Math.round(location.coords.altitude) : null,
      });
    } catch (error) {
      Alert.alert('Error GPS', 'No se pudo obtener la ubicación actual. Verifica que el GPS esté encendido.');
    } finally {
      setLoading(false);
    }
  };

  // Enviar mensaje SOS por SMS (Funciona sin datos móviles)
  const enviarSMS = async () => {
    if (!coords) return;

    const isAvailable = await SMS.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert('No disponible', 'El servicio de SMS no está disponible en este dispositivo.');
      return;
    }

    const mapUrl = `https://maps.google.com/?q=${coords.lat},${coords.lon}`;
    const mensaje = `🚨 ¡EMERGENCIA EN MONTAÑA! Requiero asistencia.\n\n📍 Ubicación:\nLat: ${coords.lat}\nLon: ${coords.lon}${coords.alt ? `\nAltitud: ${coords.alt} msnm` : ''}\n\nVer en mapa: ${mapUrl}`;

    await SMS.sendSMSAsync([], mensaje);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.titulo}>🚨 Alerta SOS / Emergencia</Text>
          <Text style={styles.descripcion}>
            Obtén tus coordenadas exactas para enviar una señal de auxilio vía SMS sin depender de internet.
          </Text>

          <TouchableOpacity style={styles.btnGps} onPress={obtenerUbicacion} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnTexto}>📍 Obtener Mi Ubicación GPS</Text>
            )}
          </TouchableOpacity>

          {coords && (
            <View style={styles.coordsBox}>
              <Text style={styles.coordLabel}>Latitud: <Text style={styles.coordValue}>{coords.lat}</Text></Text>
              <Text style={styles.coordLabel}>Longitud: <Text style={styles.coordValue}>{coords.lon}</Text></Text>
              {coords.alt !== null && (
                <Text style={styles.coordLabel}>Altitud: <Text style={styles.coordValue}>{coords.alt} msnm</Text></Text>
              )}
            </View>
          )}

          {coords && (
            <TouchableOpacity style={styles.btnEnviar} onPress={enviarSMS}>
              <Text style={styles.btnTexto}>📲 Enviar SMS de Auxilio</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.btnCerrar} onPress={onClose}>
            <Text style={styles.btnCerrarTexto}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 8,
    textAlign: 'center',
  },
  descripcion: {
    color: '#94a3b8',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
  },
  btnGps: {
    backgroundColor: '#0284c7',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  btnEnviar: {
    backgroundColor: '#dc2626',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  btnTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  coordsBox: {
    backgroundColor: '#0f172a',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  coordLabel: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 4,
  },
  coordValue: {
    color: '#38bdf8',
    fontWeight: 'bold',
  },
  btnCerrar: {
    padding: 10,
    alignItems: 'center',
  },
  btnCerrarTexto: {
    color: '#64748b',
    fontWeight: '600',
  },
});

export default SosModal;