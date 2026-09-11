import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🏔️ Montaña App</Text>
      <Text style={styles.subtitle}>Panel del Guía & Rutas</Text>

      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push('/rutas')}
      >
        <Text style={styles.cardIcon}>🥾</Text>
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>Rutas & Senderos</Text>
          <Text style={styles.cardDescription}>
            Explora mapas, elevaciones y niveles de dificultad.
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push('/insignias')}
      >
        <Text style={styles.cardIcon}>🎖️</Text>
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>Insignias de Guías</Text>
          <Text style={styles.cardDescription}>
            Gestión y reconocimiento para los guías del grupo.
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push('/checklist')}
      >
        <Text style={styles.cardIcon}>🎒</Text>
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>Equipo & Checklist</Text>
          <Text style={styles.cardDescription}>
            Revisa el equipo necesario antes de cada expedición.
          </Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginTop: 20 },
  subtitle: { fontSize: 16, color: '#38bdf8', marginBottom: 20 },
  card: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardIcon: { fontSize: 32, marginRight: 16 },
  cardTextContainer: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  cardDescription: { color: '#94a3b8', fontSize: 13, marginTop: 4 },
});