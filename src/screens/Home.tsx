import { ExerciseCard } from "@components/ExerciseCard";
import { Group } from "@components/Group";
import { HomeHeader } from "@components/HomeHeader";
import { Loading } from "@components/Loading";
import { ExerciseDTO } from "@dtos/ExerciseDTO";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { AppNavigatorRoutesProps } from "@routes/app.routes";
import { api } from "@services/api";
import { AppError } from "@utils/AppError";
import { VStack, FlatList, HStack, Heading, Text, useToast } from "native-base";
import { useCallback, useEffect, useState } from "react";

export function Home() {
  const [groups, setGroups] = useState<string[]>([])
  const [exercises, setExercises] = useState<ExerciseDTO[]>([])
  const [groupSelected, setGroupSelected] = useState('antebraco')
  const [isLoading, setIsLoading] = useState(true)

  const toast = useToast()

  const navigation = useNavigation<AppNavigatorRoutesProps>()

  const handleOpenExerciseDetails = (exerciseId: string) => {
    navigation.navigate("exercise", { exerciseId })
  }

  const fetchGroups = async () => {
    try {
      const { data } = await api.get('/groups')
      setGroups(data)
    } catch (error) {
      const isAppError = error instanceof AppError
      const title = isAppError ? error.message : 'Não foi possível carregar os grupos. Tente mais tarde.'
      toast.show({ title, placement: 'top', bgColor: 'red.500' })
    }
  }

  const fetchExercisesByGroup = async () => {
    try {
      setIsLoading(true)

      const { data } = await api.get(`/exercises/bygroup/${groupSelected}`)
      setExercises(data)
    } catch (error) {
      const isAppError = error instanceof AppError
      const title = isAppError ? error.message : 'Não foi possível carregar os exercícios. Tente mais tarde.'

      toast.show({ title, placement: 'top', bgColor: 'red.500' })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchGroups()
  }, [])

  useFocusEffect(useCallback(() => {
    fetchExercisesByGroup()
  }, [groupSelected]))

  return (
    <VStack flex={1}>
      <HomeHeader />

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={groups}
        keyExtractor={item => item}
        renderItem={({ item }) => (
          <Group
            name={item}
            isActive={groupSelected.toLocaleUpperCase() === item.toLocaleUpperCase()}
            onPress={() => setGroupSelected(item)}
          />
        )}
        _contentContainerStyle={{ px: 8 }}
        my={10}
        maxH={10}
        minH={10}
      />
      {isLoading ? <Loading /> :
        <VStack flex={1} px={8}>
          <HStack justifyContent="space-between" mb={5}>
            <Heading color="gray.200" fontSize="md" fontFamily="heading">Exercícios</Heading>
            <Text color="gray.200" fontSize="sm">{exercises.length}</Text>
          </HStack>

          <FlatList
            data={exercises}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <ExerciseCard
                onPress={() => handleOpenExerciseDetails(item.id)}
                data={item}
              />
            )}
            showsVerticalScrollIndicator={false}
            _contentContainerStyle={{ paddingBottom: 20 }}
          />
        </VStack>
      }
    </VStack>
  )
}