import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Platform, Alert } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/use-theme';
import { useTaskManager } from '@/hooks/use-task-manager';
import { TaskPriority, Task } from '@/models/Task';
import { SymbolIcon } from '@/components/symbol-icon';
import { createAppStyles } from '@/constants/styles';

/**
 * HomeScreen of Taskly. Handles tasks display, empty state, and task creation
 * in a single, unified view to avoid routing failures and reduce boilerplate.
 */
export default function HomeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { shared: sharedStyles, index: styles } = createAppStyles(theme);
  const { tasks, profile, loaded, addTask, toggleTaskCompleted, deleteTask } = useTaskManager();

  // Screen state
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'completed'>('idle');

  // Group tasks by priority
  const highTasks = tasks.filter(t => t.getPriority() === TaskPriority.HIGH);
  const medTasks = tasks.filter(t => t.getPriority() === TaskPriority.MEDIUM);
  const lowTasks = tasks.filter(t => t.getPriority() === TaskPriority.LOW);

  // Computes the dynamic greeting based on the current local system hour
  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'Buenos días';
    if (hour >= 12 && hour < 19) return 'Buenas tardes';
    return 'Buenas noches';
  };

  // Handles adding task with micro-interaction animation
  const handleSaveTask = () => {
    if (!title.trim()) {
      if (Platform.OS === 'web') alert('Por favor, ingresa un título.');
      else Alert.alert('Campo Requerido', 'Por favor, ingresa un título.');
      return;
    }

    setSaveStatus('saving');
    setTimeout(async () => {
      await addTask(title, description, priority);
      setSaveStatus('completed');
      setTimeout(() => {
        setTitle('');
        setDescription('');
        setPriority(TaskPriority.MEDIUM);
        setSaveStatus('idle');
        setIsAddingTask(false);
      }, 700);
    }, 600);
  };

  if (!loaded) return <View style={sharedStyles.container} />;

  /* ==========================================================
     FORM STATE: CREAR NUEVA TAREA
     ========================================================== */
  if (isAddingTask) {
    return (
      <View style={sharedStyles.container}>
        <View style={[sharedStyles.header, { paddingTop: insets.top, height: 64 + insets.top }]}>
          <View style={sharedStyles.headerContent}>
            <Pressable onPress={() => setIsAddingTask(false)} style={styles.iconPadding}>
              <SymbolIcon name="close" color={theme.onSurfaceVariant} size={24} />
            </Pressable>
            <Text style={sharedStyles.headerTitle}>Taskly</Text>
            <SymbolIcon name="smart_toy" color={theme.primary} size={24} />
          </View>
        </View>

        <ScrollView style={sharedStyles.scrollView} contentContainerStyle={sharedStyles.scrollContent}>
          <SafeAreaView style={sharedStyles.safeArea} edges={['left', 'right']}>
            <View style={styles.formHeader}>
              <Text style={[styles.heading, { color: theme.onSurface }]}>Nueva Tarea</Text>
              <Text style={[styles.subheading, { color: theme.onSurfaceVariant }]}>Define tus próximos pasos.</Text>
            </View>

            <View style={[styles.formCard, { backgroundColor: theme.surfaceContainerLowest, borderColor: theme.surfaceVariant }]}>
              {/* Title Input */}
              <View style={sharedStyles.inputGroup}>
                <Text style={sharedStyles.label}>Título</Text>
                <TextInput
                  style={sharedStyles.input}
                  placeholder="¿Qué necesitas hacer?"
                  placeholderTextColor={theme.outlineVariant}
                  value={title}
                  onChangeText={setTitle}
                  editable={saveStatus === 'idle'}
                />
              </View>

              {/* Description Input */}
              <View style={sharedStyles.inputGroup}>
                <Text style={sharedStyles.label}>Descripción</Text>
                <TextInput
                  style={[sharedStyles.input, styles.textArea]}
                  placeholder="Añade más detalles si los necesitas..."
                  placeholderTextColor={theme.outlineVariant}
                  multiline
                  numberOfLines={4}
                  value={description}
                  onChangeText={setDescription}
                  editable={saveStatus === 'idle'}
                />
              </View>

              {/* Priority Select */}
              <View style={sharedStyles.inputGroup}>
                <Text style={sharedStyles.label}>Prioridad</Text>
                <View style={styles.priorityRow}>
                  {Object.values(TaskPriority).map(p => {
                    const isActive = priority === p;
                    let activeBg: string = theme.backgroundElement;
                    let activeBorder: string = theme.primary;
                    let activeText: string = theme.primary;
                    let iconColor: string = theme.outline;
                    let iconName: 'flag' | 'schedule' | 'task_alt' = 'task_alt';

                    if (p === TaskPriority.HIGH) {
                      activeBg = theme.errorContainer;
                      activeBorder = theme.error;
                      activeText = theme.error;
                      iconName = 'flag';
                      if (isActive) iconColor = theme.error;
                    } else if (p === TaskPriority.MEDIUM) {
                      activeBg = theme.secondaryContainer;
                      activeBorder = theme.secondary;
                      activeText = theme.secondary;
                      iconName = 'schedule';
                      if (isActive) iconColor = theme.secondary;
                    } else if (p === TaskPriority.LOW) {
                      if (isActive) iconColor = theme.primary;
                    }

                    return (
                      <Pressable
                        key={p}
                        style={[
                          styles.pButton,
                          { borderColor: theme.surfaceVariant },
                          isActive && { backgroundColor: activeBg, borderColor: activeBorder },
                        ]}
                        onPress={() => setPriority(p)}
                        disabled={saveStatus !== 'idle'}
                      >
                        <SymbolIcon name={iconName} color={iconColor} size={16} />
                        <Text style={[styles.pText, { color: theme.onSurfaceVariant }, isActive && { color: activeText, fontWeight: '700' }]}>
                          {p === TaskPriority.HIGH ? 'Alta' : p === TaskPriority.MEDIUM ? 'Media' : 'Baja'}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actions}>
                <Pressable
                  style={({ pressed }) => [
                    sharedStyles.primaryButton,
                    { backgroundColor: saveStatus === 'completed' ? theme.secondary : theme.primary, flex: 1 },
                    pressed && sharedStyles.primaryButtonPressed,
                  ]}
                  onPress={handleSaveTask}
                  disabled={saveStatus !== 'idle'}
                >
                  <Text style={sharedStyles.primaryButtonText}>
                    {saveStatus === 'saving' ? 'Guardando...' : saveStatus === 'completed' ? '¡Guardado!' : 'Guardar'}
                  </Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.cancelBtn,
                    { backgroundColor: theme.surfaceContainerHigh },
                    pressed && sharedStyles.primaryButtonPressed,
                  ]}
                  onPress={() => setIsAddingTask(false)}
                  disabled={saveStatus !== 'idle'}
                >
                  <Text style={[styles.cancelBtnText, { color: theme.onSurfaceVariant }]}>Cancelar</Text>
                </Pressable>
              </View>
            </View>
          </SafeAreaView>
        </ScrollView>
      </View>
    );
  }

  /* ==========================================================
     MAIN LIST STATE (TAREAS LIST / EMPTY STATE)
     ========================================================== */
  return (
    <View style={sharedStyles.container}>
      <View style={[sharedStyles.header, { paddingTop: insets.top, height: 64 + insets.top }]}>
        <View style={sharedStyles.headerContent}>
          <View style={sharedStyles.headerTitleContainer}>
            <SymbolIcon name="smart_toy" color={theme.primary} size={26} style={sharedStyles.logoIcon} />
            <Text style={sharedStyles.headerTitle}>Taskly</Text>
          </View>
        </View>
      </View>

      <ScrollView style={sharedStyles.scrollView} contentContainerStyle={sharedStyles.scrollContent}>
        {tasks.length > 0 ? (
          <SafeAreaView style={sharedStyles.safeArea} edges={['left', 'right']}>
            <View style={styles.greet}>
              <Text style={[styles.heading, { color: theme.primary }]}>¡{getGreeting()} {profile.getName()}!</Text>
              <Text style={[styles.subheading, { color: theme.onSurfaceVariant }]}>¿Listo para los objetivos de hoy?</Text>
            </View>

            <View style={styles.listWrapper}>
              {/* High Priority Tasks */}
              {highTasks.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.secHeader}>
                    <SymbolIcon name="flag" color={theme.error} size={18} />
                    <Text style={[styles.secTitle, { color: theme.onSurface }]}>Prioridad Alta</Text>
                  </View>
                  {highTasks.map(t => (
                    <TaskRow key={t.getId()} task={t} theme={theme} onToggle={() => toggleTaskCompleted(t.getId())} onDelete={() => deleteTask(t.getId())} styles={styles} />
                  ))}
                </View>
              )}

              {/* Medium Priority Tasks */}
              {medTasks.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.secHeader}>
                    <SymbolIcon name="schedule" color={theme.secondary} size={18} />
                    <Text style={[styles.secTitle, { color: theme.onSurface }]}>Prioridad Media</Text>
                  </View>
                  {medTasks.map(t => (
                    <TaskRow key={t.getId()} task={t} theme={theme} onToggle={() => toggleTaskCompleted(t.getId())} onDelete={() => deleteTask(t.getId())} styles={styles} />
                  ))}
                </View>
              )}

              {/* Low Priority Tasks */}
              {lowTasks.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.secHeader}>
                    <SymbolIcon name="task_alt" color={theme.primary} size={18} />
                    <Text style={[styles.secTitle, { color: theme.onSurface }]}>Prioridad Baja</Text>
                  </View>
                  {lowTasks.map(t => (
                    <TaskRow key={t.getId()} task={t} theme={theme} onToggle={() => toggleTaskCompleted(t.getId())} onDelete={() => deleteTask(t.getId())} styles={styles} />
                  ))}
                </View>
              )}
            </View>
          </SafeAreaView>
        ) : (
          <SafeAreaView style={styles.emptyWrap} edges={['left', 'right']}>
            <View style={styles.emptyCard}>
              <View style={styles.imgContainer}>
                <Image source={require('@/assets/images/taskly empty.png')} style={styles.robotImg} contentFit="contain" />
              </View>
              <Text style={[styles.emptyHead, { color: theme.onSurface }]}>No tienes tareas creadas</Text>
              <Text style={[styles.emptySub, { color: theme.onSurfaceVariant }]}>Tu lista está limpia. ¡Buen momento para planificar!</Text>
              <Pressable style={({ pressed }) => [sharedStyles.primaryButton, pressed && sharedStyles.primaryButtonPressed]} onPress={() => setIsAddingTask(true)}>
                <SymbolIcon name="add" color={theme.onPrimary} size={20} />
                <Text style={sharedStyles.primaryButtonText}>CREAR TAREA</Text>
              </Pressable>
            </View>
          </SafeAreaView>
        )}
      </ScrollView>

      {tasks.length > 0 && (
        <Pressable style={({ pressed }) => [styles.fab, { backgroundColor: theme.primary }, pressed && styles.fabPressed]} onPress={() => setIsAddingTask(true)}>
          <SymbolIcon name="add" color={theme.onPrimary} size={28} />
        </Pressable>
      )}
    </View>
  );
}

/**
 * TaskRow subcomponent representing a list item card.
 */
function TaskRow({ task, theme, onToggle, onDelete, styles }: { task: Task; theme: any; onToggle: () => void; onDelete: () => void; styles: any }) {
  const comp = task.isCompleted();
  return (
    <View style={[styles.card, { backgroundColor: theme.surfaceContainerLowest, borderColor: theme.surfaceVariant, opacity: comp ? 0.6 : 1 }]}>
      <Pressable onPress={onToggle} style={styles.cardPress}>
        <View style={[styles.cardChk, { borderColor: theme.primary }, comp && { backgroundColor: theme.primary }]}>
          {comp && <SymbolIcon name="task_alt" color={theme.onPrimary} size={14} />}
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.cardTitle, { color: theme.onSurface }, comp && styles.cardTitleComp]}>{task.getTitle()}</Text>
          {task.getDescription().trim() !== '' && (
            <Text style={[styles.cardDesc, { color: theme.onSurfaceVariant }, comp && styles.cardTitleComp]} numberOfLines={1}>{task.getDescription()}</Text>
          )}
        </View>
      </Pressable>
      <Pressable onPress={onDelete} style={styles.delBtn}>
        <SymbolIcon name="delete" color={theme.onSurfaceVariant} size={18} />
      </Pressable>
    </View>
  );
}
