import { Image } from 'expo-image';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { SymbolIcon } from '@/components/symbol-icon';
import { createAppStyles } from '@/constants/styles';
import { useTaskManager } from '@/hooks/use-task-manager';
import { useTheme } from '@/hooks/use-theme';
import { Task, TaskPriority } from '@/models/Task';

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

  // Location state
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number; address?: string } | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Fetch current GPS location and set it
  const fetchCurrentLocation = async () => {
    let loc = null;
    try {
      // Try to get last known position first (fast and reliable)
      loc = await Location.getLastKnownPositionAsync({});
      if (!loc) {
        // Request balanced accuracy location to avoid timeout/failure on simulators
        loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
      }
    } catch (posError) {
      console.warn("Could not retrieve current GPS position:", posError);
    }

    if (loc) {
      const initialLoc = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };
      setSelectedLocation(initialLoc);
      reverseGeocode(loc.coords.latitude, loc.coords.longitude);
    } else {
      // Default fallback location (center of Bogotá) to let user select location manually
      const defaultLoc = {
        latitude: 4.6097,
        longitude: -74.0817,
        address: "Bogotá, Colombia"
      };
      setSelectedLocation(defaultLoc);
      reverseGeocode(defaultLoc.latitude, defaultLoc.longitude);
    }
  };

  // Request location permission
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationPermission(true);
        await fetchCurrentLocation();
      } else {
        setLocationPermission(false);
      }
    } catch (e) {
      setLocationPermission(false);
    }
  };

  // Reverse geocoding via Google REST HTTP or Expo local geocoder fallback
  const reverseGeocode = async (lat: number, lng: number) => {
    setIsGeocoding(true);
    try {
      const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (apiKey && apiKey.trim() !== '') {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=es`
        );
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          const formatted = data.results[0].formatted_address;
          const parts = formatted.split(',');
          const shortAddress = parts.length > 1 ? `${parts[0].trim()}, ${parts[1].trim()}` : formatted;
          setSelectedLocation({ latitude: lat, longitude: lng, address: shortAddress });
          return;
        }
      }

      // Fallback for native devices using expo-location
      if (Platform.OS !== 'web') {
        const [addr] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
        if (addr) {
          const shortAddress = [addr.street, addr.streetNumber, addr.city]
            .filter(Boolean)
            .join(', ');
          setSelectedLocation({ latitude: lat, longitude: lng, address: shortAddress || `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}` });
          return;
        }
      }

      setSelectedLocation({ latitude: lat, longitude: lng, address: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}` });
    } catch (e) {
      console.error('Error reverse geocoding:', e);
      setSelectedLocation({ latitude: lat, longitude: lng, address: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}` });
    } finally {
      setIsGeocoding(false);
    }
  };

  // Effect to handle permission request and location fetching when form is opened
  useEffect(() => {
    if (isAddingTask && locationEnabled) {
      if (locationPermission === null) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        requestLocationPermission();
      } else if (locationPermission === true && !selectedLocation) {
        fetchCurrentLocation();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAddingTask, locationEnabled, locationPermission]);

  const handleMapPress = (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
    reverseGeocode(latitude, longitude);
  };

  const handleMarkerDragEnd = (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
    reverseGeocode(latitude, longitude);
  };

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
    // Strip HTML/Script tags to prevent XSS
    const sanitizedTitle = title.replace(/<[^>]*>/g, '').trim();
    const sanitizedDescription = description.replace(/<[^>]*>/g, '').trim();

    if (!sanitizedTitle) {
      if (Platform.OS === 'web') alert('Por favor, ingresa un título válido.');
      else Alert.alert('Campo Requerido', 'Por favor, ingresa un título válido.');
      return;
    }

    if (sanitizedTitle.length > 100) {
      const errorMsg = 'El título no puede superar los 100 caracteres.';
      if (Platform.OS === 'web') alert(errorMsg);
      else Alert.alert('Límite de caracteres', errorMsg);
      return;
    }

    if (sanitizedDescription.length > 1000) {
      const errorMsg = 'La descripción no puede superar los 1000 caracteres.';
      if (Platform.OS === 'web') alert(errorMsg);
      else Alert.alert('Límite de caracteres', errorMsg);
      return;
    }

    setSaveStatus('saving');
    setTimeout(async () => {
      await addTask(
        sanitizedTitle,
        sanitizedDescription,
        priority,
        locationEnabled && selectedLocation ? selectedLocation : undefined
      );
      setSaveStatus('completed');
      setTimeout(() => {
        setTitle('');
        setDescription('');
        setPriority(TaskPriority.MEDIUM);
        setLocationEnabled(true);
        setSelectedLocation(null);
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

              {/* Ubicación Toggle */}
              <View style={styles.toggleRow}>
                <Text style={sharedStyles.label}>Agregar ubicación</Text>
                <Switch
                  value={locationEnabled}
                  onValueChange={(val) => {
                    setLocationEnabled(val);
                    if (val && locationPermission === null) {
                      requestLocationPermission();
                    }
                  }}
                  trackColor={{ false: theme.surfaceVariant, true: theme.primaryContainer }}
                  thumbColor={locationEnabled ? theme.primary : theme.outline}
                />
              </View>

              {/* Ubicación Map / Permission message */}
              {locationEnabled && (
                <View style={styles.locationContainer}>
                  {locationPermission === null ? (
                    <View style={[styles.infoBox, { borderColor: theme.surfaceVariant }]}>
                      <Text style={[styles.infoText, { color: theme.onSurfaceVariant }]}>Solicitando permisos de ubicación...</Text>
                    </View>
                  ) : locationPermission === false ? (
                    <View style={[styles.errorBox, { backgroundColor: theme.errorContainer, borderColor: theme.error }]}>
                      <SymbolIcon name="error" color={theme.error} size={20} />
                      <Text style={[styles.errorText, { color: theme.error }]}>
                        Permiso de ubicación denegado. Habilita los permisos en la configuración de tu dispositivo para usar el mapa.
                      </Text>
                    </View>
                  ) : !selectedLocation ? (
                    <View style={[styles.infoBox, { borderColor: theme.surfaceVariant }]}>
                      <Text style={[styles.infoText, { color: theme.onSurfaceVariant }]}>Obteniendo ubicación del GPS...</Text>
                    </View>
                  ) : (
                    <View style={[styles.mapWrapper, { borderColor: theme.surfaceVariant }]}>
                      {Platform.OS === 'web' ? (
                        <View style={[styles.webMapPlaceholder, { backgroundColor: theme.surfaceContainerHigh }]}>
                          <SymbolIcon name="place" color={theme.primary} size={32} />
                          <Text style={[styles.webMapText, { color: theme.onSurfaceVariant }]}>
                            Mapa no disponible en Web. Ubicación fijada en:
                          </Text>
                          <Text style={[styles.webMapAddress, { color: theme.onSurface }]}>
                            {selectedLocation.address || 'Obteniendo dirección...'}
                          </Text>
                        </View>
                      ) : (
                        <>
                          <MapView
                            provider={PROVIDER_GOOGLE}
                            style={styles.map}
                            initialRegion={{
                              latitude: selectedLocation.latitude,
                              longitude: selectedLocation.longitude,
                              latitudeDelta: 0.00922,
                              longitudeDelta: 0.00421,
                            }}
                            onPress={handleMapPress}
                          >
                            <Marker
                              coordinate={{
                                latitude: selectedLocation.latitude,
                                longitude: selectedLocation.longitude,
                              }}
                              draggable
                              onDragEnd={handleMarkerDragEnd}
                              title="Ubicación de la Tarea"
                              description={selectedLocation.address}
                            />
                          </MapView>
                          <View style={[styles.addressBar, { backgroundColor: theme.surfaceContainer, borderTopColor: theme.surfaceVariant }]}>
                            <SymbolIcon name="place" color={theme.primary} size={16} />
                            <Text style={[styles.addressText, { color: theme.onSurface }]} numberOfLines={1}>
                              {isGeocoding ? 'Obteniendo dirección...' : selectedLocation?.address || 'Selecciona un punto en el mapa'}
                            </Text>
                          </View>
                        </>
                      )}
                    </View>
                  )}
                </View>
              )}

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
          {task.getLocation() && task.getLocation()?.address && (
            <View style={styles.cardLocationRow}>
              <SymbolIcon name="place" color={theme.primary} size={12} />
              <Text style={[styles.cardLocationText, { color: theme.primary }]} numberOfLines={1}>
                {task.getLocation()?.address}
              </Text>
            </View>
          )}
        </View>
      </Pressable>
      <Pressable onPress={onDelete} style={styles.delBtn}>
        <SymbolIcon name="delete" color={theme.onSurfaceVariant} size={18} />
      </Pressable>
    </View>
  );
}
