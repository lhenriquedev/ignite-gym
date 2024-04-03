import { VStack, Image, Text, Center, Heading, ScrollView, useToast } from 'native-base'
import { useNavigation } from '@react-navigation/native';

import { AuthNavigatorRoutesProps } from '@routes/auth.routes'

import LogoSvg from '@assets/logo.svg';
import BackgroundImg from '@assets/background.png';

import { Input } from '@components/Input';
import { Button } from '@components/Button';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@hooks/useAuth';
import { AppError } from '@utils/AppError';
import { useState } from 'react';

const schema = z.object({
  email: z.string().min(1, 'O e-mail é obrigatório').email('O e-mail é inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 dígitos')
})

type FormData = z.infer<typeof schema>

export function SignIn() {
  const [isLoading, setIsLoading] = useState(false)

  const { signIn } = useAuth()

  const navigation = useNavigation<AuthNavigatorRoutesProps>()
  const toast = useToast()

  const { control, formState: { errors }, handleSubmit } = useForm<FormData>({
    defaultValues: {
      email: '',
      password: ''
    },
    resolver: zodResolver(schema)
  })

  const handleNewAccount = () => navigation.navigate('signUp')

  const handleSignIn = async ({ email, password }: FormData) => {
    try {
      setIsLoading(true)
      await signIn(email, password)

    } catch (error) {
      const isAppError = error instanceof AppError

      const title = isAppError ? error.message : 'Não foi possível entrar. Tente novamente mais tarde.'
      setIsLoading(false)

      toast.show({ title, placement: 'top', bgColor: 'red.500' })
    }
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsHorizontalScrollIndicator={false}>
      <VStack flex={1} bg="gray.700" px={10}>
        <Image
          source={BackgroundImg}
          defaultSource={BackgroundImg}
          alt="Pessoas treinando em uma academia"
          resizeMode='contain'
          position='absolute'
        />

        <Center my={24}>
          <LogoSvg />
          <Text color="gray.100" fontSize="sm">Treine sua mente e o seu corpo</Text>
        </Center>

        <Center>
          <Heading color="gray.100" fontSize="xl" mb={6} fontFamily="heading">
            Acesse sua conta
          </Heading>

          <Controller
            control={control}
            name='email'
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder='E-mail'
                keyboardType='email-address'
                autoCapitalize='none'
                onChangeText={onChange}
                value={value}
                errorMessage={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name='password'
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder='Senha'
                secureTextEntry
                onChangeText={onChange}
                value={value}
                errorMessage={errors.password?.message}
              />
            )}
          />

          <Button title='Entrar' onPress={handleSubmit(handleSignIn)} isLoading={isLoading} />
        </Center>

        <Center mt="24">
          <Text color="gray.100" fontSize="sm" mb={3} fontFamily="body">
            Ainda não tem acesso?
          </Text>

          <Button title='Criar conta' variant="outline" onPress={handleNewAccount} />
        </Center>
      </VStack>
    </ScrollView>
  )
}