import { useState } from 'react';
import { Heading, VStack, SectionList, Text } from "native-base";

import { HistoryCard } from "@components/HistoryCard";
import { ScreenHeader } from "@components/ScreenHeader";

export function History() {
  const [exercises, setExercises] = useState([
    {
      title: '26.08.2022',
      data: ['Puxada frontal', 'Remada unilateral', 'Remada curvada', 'Levantamento terra']
    },
    {
      title: '27.08.2022',
      data: ['Puxada frontal', 'Remada unilateral']
    }
  ])

  return (
    <VStack flex={1}>
      <ScreenHeader title="Histórico de exercícios" />

      <SectionList
        sections={exercises}
        keyExtractor={item => item}
        renderItem={({ item }) => (
          <HistoryCard />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <Heading color="gray.200" fontSize="md" mt={10} mb={3}>{title}</Heading>
        )}
        contentContainerStyle={exercises.length === 0 ? { flex: 1, justifyContent: 'center' } : {} }
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