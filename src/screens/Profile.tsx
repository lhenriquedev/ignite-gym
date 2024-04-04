import { useState } from "react";
import { TouchableOpacity } from "react-native";

import * as ImagePicker from "expo-image-picker"
import * as FileSystem from "expo-file-system"

import { ScreenHeader } from "@components/ScreenHeader";
import { UserPhoto } from "@components/UserPhoto";
import { Input } from "@components/Input";

import { Center, ScrollView, VStack, Skeleton, Text, Heading, useToast } from "native-base";
import { Button } from "@components/Button";
import { Controller, useForm } from "react-hook-form";
import { useAuth } from "@hooks/useAuth";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppError } from "@utils/AppError";
import { api } from "@services/api";

const PHOTO_SIZE = 33

const schema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  email: z.string().email('O e-mail é inválido'),
  old_password: z.string().min(1, 'A senha antiga é obrigatória'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 dígitos').optional().nullable().transform(value => value ?? null),
  password_confirm: z.string().optional()
    .nullable()
    .transform(value => value ?? null)
}).refine(data => data.password === data.password_confirm, {
  message: 'A confirmação da senha não confere',
  path: ['password_confirm']
})

type FormDataProps = z.infer<typeof schema>

export function Profile() {
  const [isUpdating, setIsUpdating] = useState(false)
  const [photoIsLoading, setPhotoIsLoading] = useState(false)
  const [userPhoto, setUserPhoto] = useState('https://github.com/lhenriquedev.png')

  const { user, updateUserProfile } = useAuth()
  const toast = useToast()

  const { control, handleSubmit, formState: { errors } } = useForm<FormDataProps>({
    defaultValues: {
      name: user.name,
      email: user.email,
    },
    resolver: zodResolver(schema)
  })

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

        if (photoInfo.exists && (photoInfo.size / 1024 / 1024) > 5) {
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

  const handleProfileUpdate = async (data: FormDataProps) => {
    
    
    try {
      setIsUpdating(true)
      const userUpdated = user
      userUpdated.name = data.name

      await api.put('/users', data)
      await updateUserProfile(userUpdated)

      toast.show({ title: 'Perfil alterado com sucesso!', placement: 'top', bgColor: 'green.700' })
    } catch (error) {
      const isAppError = error instanceof AppError
      const title = isAppError ? error.message : 'Não foi possível alterar o perfil. Tente novamente mais tarde.'

      toast.show({ title, placement: 'top', bgColor: 'red.500' })
    } finally {
      setIsUpdating(false)
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

          <Controller
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Nome"
                bg="gray.600"
                value={value}
                onChangeText={onChange}
                errorMessage={errors.name?.message}
              />
            )}
            control={control}
            name="name"
          />

          <Controller
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Email"
                isDisabled
                bg="gray.600"
                value={value}
                onChangeText={onChange}
              />
            )}
            control={control}
            name="email"
          />
        </Center>

        <VStack px={10} mt={12} mb={9}>
          <Heading color="gray.200" fontSize="md" mb={2} fontFamily="heading">Alterar senha</Heading>

          <Controller
            control={control}
            name="old_password"
            render={({ field: { onChange } }) => (
              <Input
                placeholder="Senha antiga"
                bg="gray.600"
                onChangeText={onChange}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange } }) => (
              <Input
                placeholder="Nova senha"
                bg="gray.600"
                onChangeText={onChange}
                errorMessage={errors.password?.message}
                secureTextEntry
              />
            )}
          />

          <Controller
            control={control}
            name="password_confirm"
            render={({ field: { onChange } }) => (
              <Input
                placeholder="Confirme a nova senha"
                bg="gray.600"
                onChangeText={onChange}
                errorMessage={errors.password_confirm?.message}
                secureTextEntry
              />
            )}
          />

          <Button title="Atualizar" mt={4} onPress={handleSubmit(handleProfileUpdate)} isLoading={isUpdating}/>
        </VStack>
      </ScrollView>
    </VStack>
  )
}