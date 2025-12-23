// Placeholder screen - Client History
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ClientHistoryScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Historique des missions</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 18 },
});

export default ClientHistoryScreen;
