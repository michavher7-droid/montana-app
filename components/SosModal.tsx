import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface SosModalProps {
  visible: boolean;
  onClose: () => void;
}

const STORAGE_KEY = '@sos_emergency_contacts';

export default function SosModal({ visible, onClose }: SosModalProps) {
  const [phones, setPhones] = useState<string[]>(['', '', '']);
  const [isConfiguring, setIsConfiguring] = useState(false);

  useEffect(() => {
    if (visible) {
      loadContacts();
    }
  }, [visible]);

  // Cargar contactos guardados previamente
  const loadContacts = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Garantizar que siempre haya un array de 3 posiciones
        setPhones([parsed[0] || '', parsed[1] || '', parsed[2] || '']);
      }
    } catch (e) {
      console.error('Error cargando contactos de emergencia:', e);
    }
  };

  // Guardar contactos en AsyncStorage
  const saveContacts = async () => {
    try {
      const cleanedPhones = phones.map((p) => p.trim());
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cleanedPhones));
      setIsConfiguring(false);
      Alert.alert('Éxito', 'Contactos de emergencia guardados correctamente.');
    } catch (e) {
      Alert.alert('Error', 'No se pudieron guardar los contactos.');
    }
  };

  const handlePhoneChange = (text: string, index: number) => {
    const updated = [...phones];
    updated[index] = text;
    setPhones(updated);
  };

// Enviar SMS con coordenadas explícitas y ubicación en mapa
  const sendSosMessage = async () => {
    const activePhones = phones.map((p) => p.trim()).filter((p) => p.length > 0);

    if (activePhones.length === 0) {
      Alert.alert(
        'Sin destinatarios',
        'Por favor, configura al menos un número de emergencia antes de enviar el auxilio.',
        [{ text: 'Configurar', onPress: () => setIsConfiguring(true) }]
      );
      return;
    }

    const isAvailable = await SMS.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert('Error', 'El servicio de SMS no está disponible en este dispositivo.');
      return;
    }

    try {
      let locationText = 'Ubicación GPS no disponible';
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        
        const lat = location.coords.latitude.toFixed(6);
        const lon = location.coords.longitude.toFixed(6);
        const alt = location.coords.altitude ? `${Math.round(location.coords.altitude)}m` : 'N/A';
        
        locationText = `LAT: ${lat}, LON: ${lon}\nAltitud aprox: ${alt}\nMapa: https://maps.google.com/?q=${lat},${lon}`;
      }

      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const messageBody = `¡AUXILIO! Emergencia en montaña (${timestamp}):\n${locationText}`;

      const { result } = await SMS.sendSMSAsync(activePhones, messageBody);

      if (result === 'sent') {
        Alert.alert('Enviado', 'Mensaje de auxilio enviado correctamente.');
        onClose();
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un fallo al intentar enviar el mensaje de auxilio.');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>🚨 Emergencia SOS</Text>

          {isConfiguring ? (
            <View style={styles.configContainer}>
              <Text style={styles.subtitle}>Configurar Destinatarios (1 a 3)</Text>
              
              {phones.map((phone, idx) => (
                <View key={idx} style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Contacto {idx + 1}:</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej. 3312345678"
                    placeholderTextColor="#64748B"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={(text) => handlePhoneChange(text, idx)}
                  />
                </View>
              ))}

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.btn, styles.btnSecondary]}
                  onPress={() => setIsConfiguring(false)}
                >
                  <Text style={styles.btnTextSecondary}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btn, styles.btnSave]}
                  onPress={saveContacts}
                >
                  <Text style={styles.btnTextPrimary}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.mainContainer}>
              <Text style={styles.description}>
                Se enviará un mensaje SMS con tus coordenadas de ubicación actual a los siguientes números:
              </Text>

              <View style={styles.contactsList}>
                {phones.filter((p) => p.trim().length > 0).length > 0 ? (
                  phones
                    .map((p, idx) => ({ num: p.trim(), idx }))
                    .filter((item) => item.num.length > 0)
                    .map((item) => (
                      <Text key={item.idx} style={styles.contactItem}>
                        📱 Contacto {item.idx + 1}: {item.num}
                      </Text>
                    ))
                ) : (
                  <Text style={styles.noContactsText}>
                    ⚠️ No hay números configurados.
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.configLink}
                onPress={() => setIsConfiguring(true)}
              >
                <Text style={styles.configLinkText}>⚙️ Configurar números de emergencia</Text>
              </TouchableOpacity>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.btn, styles.btnSecondary]}
                  onPress={onClose}
                >
                  <Text style={styles.btnTextSecondary}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btn, styles.btnSos]}
                  onPress={sendSosMessage}
                >
                  <Text style={styles.btnTextPrimary}>ENVIAR SOS</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    elevation: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 12,
  },
  description: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 12,
    textAlign: 'center',
  },
  configContainer: {
    width: '100%',
  },
  mainContainer: {
    width: '100%',
  },
  inputRow: {
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#F8FAFC',
    fontSize: 14,
  },
  contactsList: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  contactItem: {
    color: '#38BDF8',
    fontSize: 13,
    marginVertical: 2,
    fontWeight: '500',
  },
  noContactsText: {
    color: '#F59E0B',
    fontSize: 13,
    textAlign: 'center',
  },
  configLink: {
    alignItems: 'center',
    marginBottom: 16,
  },
  configLinkText: {
    color: '#38BDF8',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnSecondary: {
    backgroundColor: '#334155',
  },
  btnSave: {
    backgroundColor: '#0284C7',
  },
  btnSos: {
    backgroundColor: '#EF4444',
  },
  btnTextPrimary: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  btnTextSecondary: {
    color: '#94A3B8',
    fontWeight: 'bold',
    fontSize: 13,
  },
});