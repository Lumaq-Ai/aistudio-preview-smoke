import { StyleSheet, Text, View } from 'react-native';

export default function About() {
  return (
    <View style={styles.page}>
      <Text style={styles.title}>About screen</Text>
      <Text>Generic demo content for the preview pipeline smoke test.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  title: { fontSize: 24, fontWeight: '600' },
});
