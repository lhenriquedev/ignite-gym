import { useNavigation } from '@react-navigation/native';
import { VStack, Image, Text, Center, Heading, ScrollView, useToast } from 'native-base'
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod"

import LogoSvg from '@assets/logo.svg';
import BackgroundImg from '@assets/background.png';

import { Input } from '@components/Input';
import { Button } from '@components/Button';
import { api } from '@services/api';
import { isAxiosError } from 'axios';
import { Alert } from 'react-native';
import { AppError } from '@utils/AppError';

const formSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  email: z.string().min(1, 'O e-mail é obrigatório').email('O e-mail é inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 dígitos'),
  password_confirm: z.string().min(1, 'A confirmação da senha é obrigatória')
}).refine(data => data.password === data.password_confirm, {
  message: 'A confirmação da senha não confere',
  path: ['password_confirm']
})

type FormData = z.infer<typeof formSchema>

export function SignUp() {
  const navigation = useNavigation()
  const toast = useToast()

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      password_confirm: ''
    },
    resolver: zodResolver(formSchema)
  })

  const handleGoBack = () => navigation.goBack()

  const handleSignUp = async ({ email, name, password }: FormData) => {
    try {
      const { data } = await api.post('/users', { name, email, password })
      console.log(data);
    } catch (error) {
      const isAppError = error instanceof AppError
      const title = isAppError ? error.message : 'Não foi possível criar a conta. Tente novamente mais tarde.'

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
            Cria sua conta
          </Heading>

          <Controller
            control={control}
            name='name'
            render={({ field: { onChange, value } }) => (
              <Input placeholder='Nome' onChangeText={onChange} value={value} errorMessage={errors.name?.message} />
            )}
          />

          <Controller
            control={control}
            name='email'
            render={({ field: { onChange, value } }) => (
              <Input placeholder='E-mail' keyboardType='email-address' autoCapitalize='none' onChangeText={onChange} value={value} errorMessage={errors.email?.message} />
            )}
          />

          <Controller
            control={control}
            name='password'
            render={({ field: { onChange, value } }) => (
              <Input placeholder='Senha' secureTextEntry onChangeText={onChange} value={value} errorMessage={errors.password?.message} />
            )}
          />

          <Controller
            control={control}
            name='password_confirm'
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder='Confirme a Senha'
                secureTextEntry
                onChangeText={onChange}
                value={value}
                errorMessage={errors.password_confirm?.message}
                returnKeyType='send'
                onSubmitEditing={handleSubmit(handleSignUp)}
              />
            )}
          />

          <Button title='Criar e acessar'
            onPress={handleSubmit(handleSignUp)}
          />
        </Center>

        <Button title='Voltar para o login' variant="outline" mt={24} onPress={handleGoBack} />
      </VStack>
    </ScrollView>
  )
}