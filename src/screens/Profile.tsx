import { useState } from "react";
import { TouchableOpacity } from "react-native";

import * as ImagePicker from "expo-image-picker"
import * as FileSystem from "expo-file-system"

import { ScreenHeader } from "@components/ScreenHeader";
import { UserPhoto } from "@components/UserPhoto";
import { Input } from "@components/Input";

import { Center, ScrollView, VStack, Skeleton, Text, Heading, useToast } from "native-base";
import { Button } from "@components/Button";

const PHOTO_SIZE = 33

export function Profile() {
  const [photoIsLoading, setPhotoIsLoading] = useState(false)
  const [userPhoto, setUserPhoto] = useState('https://github.com/lhenriquedev.png')

  const toast = useToast()

  const handleUserPhotoSelect = async () => {
    setPhotoIsLoading(true)

    try {
      const photoSeletected = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        aspect: [4, 4],
        allowsEditing: true
      })

      if (photoSeletected.canceled) return

      if (photoSeletected.assets[0].uri) {
        const photoInfo = await FileSystem.getInfoAsync(photoSeletected.assets[0].uri)
        
        if (photoInfo.exists && (photoInfo.size / 1024 / 1024) > 5 ) {
          return toast.show({
            title: "Essa imagem é muito grande. Escolha uma imagem de ate 5MB.",
            placement: "top",
            bgColor: "red.500",
          })
        }
        
        setUserPhoto(photoSeletected.assets[0].uri)
      }
    } catch (error) {
      console.log(error)
    } finally {
      setPhotoIsLoading(false)
    }
  }

  return (
    <VStack flex={1}>
      <ScreenHeader title="Perfil" />
      <ScrollView contentContainerStyle={{ paddingBottom: 36 }}>
        <Center mt={6} px={10}>
          {photoIsLoading ? (
            <Skeleton w={PHOTO_SIZE} h={PHOTO_SIZE} rounded="full" startColor="gray.500" endColor="gray.400" />
          ) : (
            <UserPhoto source={{ uri: userPhoto }} size={PHOTO_SIZE} alt="Imagem do usuário" />
          )}

          <TouchableOpacity onPress={handleUserPhotoSelect}>
            <Text color="green.500" fontSize="md" mt={2} fontWeight="bold" mb={8}>Alterar foto</Text>
          </TouchableOpacity>

          <Input
            placeholder="Nome"
            bg="gray.600"
          />

          <Input
            isDisabled
            placeholder="Email"
            bg="gray.600"
          />

        </Center>

        <VStack px={10} mt={12} mb={9}>
          <Heading color="gray.200" fontSize="md" mb={2}  fontFamily="heading">Alterar senha</Heading>

          <Input bg="gray.600" placeholder="Senha antiga" secureTextEntry />
          <Input bg="gray.600" placeholder="Nova senha" secureTextEntry />
          <Input bg="gray.600" placeholder="Confirme a nova senha" secureTextEntry />

          <Button title="Atualizar" mt={4} />
        </VStack>
      </ScrollView>
    </VStack>
  )
}