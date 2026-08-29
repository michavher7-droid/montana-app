import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function InsigniasScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>🎖️ Insignias de Guías</Text>
      <Text style={styles.headerSubtitle}>Reconocimientos del equipo</Text>

      <View style={styles.badgeCard}>
        <Text style={styles.badgeIcon}>🥾</Text>
        <View style={styles.badgeInfo}>
          <Text style={styles.badgeTitle}>Guía de Senderismo</Text>

          <Text style={styles.badgeDesc}>Líder certificado en rutas de alta y media montaña.</Text>

        </View>
      </View>

      <View style={styles.badgeCard}>
        <Text style={styles.badgeIcon}>🧭</Text>
        <View style={styles.badgeInfo}>
          <Text style={styles.badgeTitle}>Navegación & Orientación</Text>
          <Text style={styles.badgeDesc}>Experto en cartografía, brújula y lectura de terreno.</Text>
        </View>
      </View>

      <View style={styles.badgeCard}>
        <Text style={styles.badgeIcon}>🩹</Text>
        <View style={styles.badgeInfo}>
          <Text style={styles.badgeTitle}>Primeros Auxilios</Text>
          <Text style={styles.badgeDesc}>Capacitado en atención médica en zonas agrestes.</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#38BDF8',
    marginBottom: 25,
  },
  badgeCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  badgeIcon: {
    fontSize: 36,
    marginRight: 16,
  },
  badgeInfo: {
    flex: 1,
  },
  badgeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F1F5F9',
    marginBottom: 2,
  },
  badgeDesc: {
    fontSize: 13,
    color: '#94A3B8',
  },
});