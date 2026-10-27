import { Image, StyleSheet, Text, View } from 'react-native';

export default function Profile() {
  return (
    <View style={styles.page}>
      <Image source={require('../../assets/tile.png')} style={styles.avatar} accessibilityLabel="Avatar" />
      <Text style={styles.title}>Profile settings screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  title: { fontSize: 24, fontWeight: '600' },
});
