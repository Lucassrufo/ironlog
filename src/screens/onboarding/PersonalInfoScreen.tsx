import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { OnboardingHeader } from './OnboardingHeader';
import { OnboardingStackParamList } from '../../types/navigation';
import { Screen } from '../../components/Screen';
import { useUser } from '../../context/UserContext';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'PersonalInfo'>;

export function PersonalInfoScreen({ navigation }: Props) {
  const { draftUser, setDraftUser } = useUser();
  const [nome, setNome] = useState(draftUser.nome ?? '');
  const [sobrenome, setSobrenome] = useState(draftUser.sobrenome ?? '');
  const [idade, setIdade] = useState(draftUser.idade ? String(draftUser.idade) : '');
  const [fotoUri, setFotoUri] = useState(draftUser.fotoUri ?? '');
  const canContinue = nome.trim().length > 1 && sobrenome.trim().length > 1 && Number(idade) > 0;

  async function handlePickPhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Autorize o acesso à galeria para definir sua foto de perfil.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.82,
    });

    if (result.canceled) {
      return;
    }

    const pickedUri = result.assets[0]?.uri;
    if (!pickedUri || !FileSystem.documentDirectory) {
      return;
    }

    const extension = pickedUri.split('.').pop()?.split('?')[0] || 'jpg';
    const localUri = `${FileSystem.documentDirectory}ironlog-profile-draft-${Date.now()}.${extension}`;

    await FileSystem.copyAsync({ from: pickedUri, to: localUri });
    setFotoUri(localUri);
    setDraftUser({ fotoUri: localUri });
  }

  return (
    <Screen>
      <OnboardingHeader
        step="Etapa 1 de 5"
        title="Vamos começar seu diário de força."
        subtitle="Adicione sua foto e informe seus dados básicos para personalizar a rotina diária."
      />

      <View style={styles.form}>
        <Pressable
          accessibilityRole="button"
          onPress={handlePickPhoto}
          style={({ pressed }) => [styles.photoPanel, { opacity: pressed ? 0.84 : 1 }]}
        >
          <View style={styles.avatarFrame}>
            {fotoUri ? (
              <Image source={{ uri: fotoUri }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person" size={42} color="#FFFFFF" />
            )}
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </View>
          </View>
          <View style={styles.photoCopy}>
            <Text style={styles.photoTitle}>{fotoUri ? 'Foto de perfil definida' : 'Adicionar foto de perfil'}</Text>
            <Text style={styles.photoText}>Ela vai aparecer na tela inicial e no seu perfil.</Text>
          </View>
        </Pressable>
        <AppInput label="Nome" value={nome} placeholder="Ex: Ana" onChangeText={setNome} />
        <AppInput label="Sobrenome" value={sobrenome} placeholder="Ex: Silva" onChangeText={setSobrenome} />
        <AppInput label="Idade" value={idade} placeholder="Ex: 28" keyboardType="number-pad" onChangeText={setIdade} />
      </View>

      <View style={styles.footer}>
        <AppButton
          label="Continuar"
          icon="arrow-forward"
          disabled={!canContinue}
          onPress={() => {
            setDraftUser({ nome, sobrenome, idade: Number(idade), fotoUri });
            navigation.navigate('BodyMetrics');
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 16,
  },
  photoPanel: {
    minHeight: 108,
    borderRadius: 8,
    backgroundColor: '#1684FF',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarFrame: {
    width: 74,
    height: 74,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  cameraBadge: {
    position: 'absolute',
    right: 5,
    bottom: 5,
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: 'rgba(5,7,11,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoCopy: {
    flex: 1,
    gap: 4,
  },
  photoTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  photoText: {
    color: '#EAF4FF',
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    marginTop: 'auto',
  },
});
