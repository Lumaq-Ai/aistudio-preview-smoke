import { Link } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function Home() {
  return (
    <View style={styles.page}>
      <Image source={require('../assets/tile.png')} style={styles.tile} accessibilityLabel="Blue tile" />
      <Text style={styles.title}>Home screen</Text>
      <Link href="/about" style={styles.link}>About</Link>
      <Link href="/settings/profile" style={styles.link}>Profile settings</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  tile: { width: 64, height: 64 },
  title: { fontSize: 24, fontWeight: '600' },
  link: { color: '#2563eb', fontSize: 16 },
});
