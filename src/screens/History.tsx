import { useCallback, useEffect, useState } from 'react';
import { Heading, VStack, SectionList, Text, useToast } from "native-base";

import { HistoryCard } from "@components/HistoryCard";
import { ScreenHeader } from "@components/ScreenHeader";
import { AppError } from '@utils/AppError';
import { api } from '@services/api';
import { useFocusEffect } from '@react-navigation/native';
import { HistoryByDayDTO } from '@dtos/HistoryByDayDTO';

export function History() {
  const [isLoading, setIsLoading] = useState(true)
  const [exercises, setExercises] = useState<HistoryByDayDTO[]>([])

  const toast = useToast()

  const fetchHistory = async () => {
    try {
      setIsLoading(true)
      
      const { data } = await api.get('/history')
      setExercises(data)
    } catch (error) {
      const isAppError = error instanceof AppError
      const title = isAppError ? error.message : 'Não foi possível carregar o histórico. Tente mais tarde.'
      toast.show({ title, placement: 'top', bgColor: 'red.500' })
    } finally {
      setIsLoading(false)
    }
  }

  useFocusEffect(useCallback(() => {
    fetchHistory()
  }, []))

  return (
    <VStack flex={1}>
      <ScreenHeader title="Histórico de exercícios" />

      <SectionList
        sections={exercises}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <HistoryCard data={item}/>
        )}
        renderSectionHeader={({ section: { title } }) => (
          <Heading color="gray.200" fontSize="md" mt={10} mb={3} fontFamily="heading">{title}</Heading>
        )}
        contentContainerStyle={exercises.length === 0 ? { flex: 1, justifyContent: 'center' } : {}}
        ListEmptyComponent={() => (
          <Text color="gray.100" fontSize="md" textAlign="center">
            Não há exercícios registrados ainda. {'\n'}
            Vamos fazer exercícios hoje?
          </Text>
        )}
        px={8}
        showsVerticalScrollIndicator={false}
      />
    </VStack>
  )
}