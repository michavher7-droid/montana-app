import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function RutasScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>🥾 Rutas & Senderos</Text>
      <Text style={styles.headerSubtitle}>Explora nuevos caminos</Text>

      <View style={styles.routeCard}>
        <View style={styles.routeHeader}>
          <Text style={styles.routeTitle}>Pico Nevado</Text>
          <Text style={styles.tagHard}>Difícil</Text>
        </View>
        <Text style={styles.routeDetails}>📏 14 km  |  ⏱️ 6 hrs  |  📈 +1,200m</Text>
      </View>

      <View style={styles.routeCard}>
        <View style={styles.routeHeader}>
          <Text style={styles.routeTitle}>Bosque del Roble</Text>
          <Text style={styles.tagMedium}>Moderada</Text>
        </View>
        <Text style={styles.routeDetails}>📏 8 km  |  ⏱️ 3 hrs  |  📈 +450m</Text>
      </View>

      <View style={styles.routeCard}>
        <View style={styles.routeHeader}>
          <Text style={styles.routeTitle}>Sendero del Río</Text>
          <Text style={styles.tagEasy}>Fácil</Text>
        </View>
        <Text style={styles.routeDetails}>📏 4 km  |  ⏱️ 1.5 hrs  |  📈 +120m</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  content: { padding: 20, paddingTop: 60 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#F8FAFC' },
  headerSubtitle: { fontSize: 15, color: '#38BDF8', marginBottom: 25 },
  routeCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  routeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  routeTitle: { fontSize: 18, fontWeight: '600', color: '#F1F5F9' },
  routeDetails: { fontSize: 13, color: '#94A3B8' },
  tagHard: { backgroundColor: '#7F1D1D', color: '#FCA5A5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, fontSize: 11, fontWeight: 'bold' },
  tagMedium: { backgroundColor: '#78350F', color: '#FDE047', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, fontSize: 11, fontWeight: 'bold' },
  tagEasy: { backgroundColor: '#14532D', color: '#86EFAC', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, fontSize: 11, fontWeight: 'bold' },
});