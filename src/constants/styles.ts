import { StyleSheet, Platform } from 'react-native';
import { MaxContentWidth, Spacing } from './theme';

/**
 * Reusable layout and screen-specific styles for the Taskly application.
 * Dynamically resolves theme colors for both light and dark modes.
 */
export function createAppStyles(theme: any) {
  return {
    shared: StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: theme.background,
      },
      header: {
        height: 64,
        width: '100%',
        backgroundColor: theme.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.surfaceContainerLow,
        justifyContent: 'center',
        paddingHorizontal: Spacing.four,
        ...Platform.select({
          ios: {
            shadowColor: '#2c694e',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            zIndex: 10,
          },
          android: {
            elevation: 2,
          },
          web: {
            position: 'sticky',
            top: 0,
            zIndex: 100,
            boxShadow: '0 1px 3px rgba(44,105,78,0.05)',
          },
        }),
      },
      headerContent: {
        maxWidth: MaxContentWidth,
        width: '100%',
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
      headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      logoIcon: {
        marginRight: Spacing.two,
      },
      headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        fontFamily: 'Quicksand',
        color: theme.primary,
      },
      scrollView: {
        flex: 1,
      },
      scrollContent: {
        flexGrow: 1,
        paddingBottom: 100,
      },
      safeArea: {
        maxWidth: MaxContentWidth,
        width: '100%',
        alignSelf: 'center',
        paddingHorizontal: Spacing.four,
        paddingVertical: Spacing.four,
      },
      inputGroup: {
        gap: Spacing.one,
        marginBottom: Spacing.three,
      },
      label: {
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'Plus Jakarta Sans',
        color: theme.onSurfaceVariant,
        marginLeft: 4,
      },
      input: {
        width: '100%',
        height: 48,
        borderWidth: 2,
        borderColor: theme.surfaceVariant,
        borderRadius: 12,
        paddingHorizontal: Spacing.three,
        fontSize: 16,
        fontFamily: 'Plus Jakarta Sans',
        color: theme.onSurface,
        backgroundColor: theme.surfaceContainerLow,
      },
      primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.two,
        height: 48,
        paddingHorizontal: Spacing.five,
        borderRadius: 24,
        backgroundColor: theme.primary,
        ...Platform.select({
          ios: {
            shadowColor: '#006a60',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 6,
          },
          android: {
            elevation: 3,
          },
        }),
      },
      primaryButtonPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
      },
      primaryButtonText: {
        fontSize: 16,
        fontWeight: '700',
        fontFamily: 'Plus Jakarta Sans',
        color: theme.onPrimary,
      },
    }),

    index: StyleSheet.create({
      iconPadding: {
        padding: 6,
      },
      greet: {
        marginBottom: Spacing.four,
      },
      formHeader: {
        marginBottom: Spacing.four,
      },
      heading: {
        fontSize: 24,
        fontWeight: '700',
        fontFamily: 'Quicksand',
      },
      subheading: {
        fontSize: 15,
        fontFamily: 'Plus Jakarta Sans',
        marginTop: 2,
      },
      formCard: {
        padding: Spacing.four,
        borderRadius: 16,
        borderWidth: 1,
        gap: Spacing.three,
      },
      textArea: {
        height: 90,
        paddingVertical: Spacing.two,
        textAlignVertical: 'top',
      },
      priorityRow: {
        flexDirection: 'row',
        gap: Spacing.two,
      },
      pButton: {
        flex: 1,
        flexDirection: 'row',
        height: 40,
        borderWidth: 2,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        gap: Spacing.one,
      },
      pText: {
        fontSize: 13,
        fontFamily: 'Plus Jakarta Sans',
      },
      actions: {
        flexDirection: 'row-reverse',
        gap: Spacing.two,
        marginTop: Spacing.two,
      },
      cancelBtn: {
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
      },
      cancelBtnText: {
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Plus Jakarta Sans',
      },
      listWrapper: {
        gap: Spacing.four,
      },
      section: {
        gap: Spacing.two,
      },
      secHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.two,
      },
      secTitle: {
        fontSize: 18,
        fontWeight: '600',
        fontFamily: 'Quicksand',
      },
      card: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.three,
        borderRadius: 12,
        borderWidth: 1,
      },
      cardPress: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: Spacing.two,
      },
      cardChk: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
      },
      cardInfo: {
        flex: 1,
      },
      cardTitle: {
        fontSize: 15,
        fontWeight: '600',
        fontFamily: 'Plus Jakarta Sans',
      },
      cardTitleComp: {
        textDecorationLine: 'line-through',
      },
      cardDesc: {
        fontSize: 12,
        fontFamily: 'Plus Jakarta Sans',
        marginTop: 1,
      },
      delBtn: {
        padding: 8,
      },
      emptyWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      },
      emptyCard: {
        maxWidth: 320,
        width: '100%',
        alignItems: 'center',
        paddingVertical: Spacing.four,
      },
      imgContainer: {
        width: 180,
        height: 180,
        marginBottom: Spacing.four,
      },
      robotImg: {
        width: '100%',
        height: '100%',
      },
      emptyHead: {
        fontSize: 20,
        fontWeight: '700',
        fontFamily: 'Quicksand',
        textAlign: 'center',
        marginBottom: Spacing.one,
      },
      emptySub: {
        fontSize: 14,
        fontFamily: 'Plus Jakarta Sans',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: Spacing.four,
      },
      fab: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 40 : 30,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      fabPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.95 }],
      },
      toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.two,
        marginBottom: Spacing.two,
      },
      locationContainer: {
        marginBottom: Spacing.three,
        gap: Spacing.two,
      },
      infoBox: {
        padding: Spacing.three,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderStyle: 'dashed',
      },
      infoText: {
        fontSize: 14,
        fontFamily: 'Plus Jakarta Sans',
        textAlign: 'center',
      },
      errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.two,
        padding: Spacing.three,
        borderRadius: 12,
        borderWidth: 1,
      },
      errorText: {
        flex: 1,
        fontSize: 13,
        fontFamily: 'Plus Jakarta Sans',
        lineHeight: 18,
      },
      mapWrapper: {
        borderRadius: 12,
        borderWidth: 1,
        overflow: 'hidden',
        height: 220,
      },
      map: {
        width: '100%',
        height: 180,
      },
      addressBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.two,
        paddingHorizontal: Spacing.three,
        paddingVertical: Spacing.two,
        borderTopWidth: 1,
      },
      addressText: {
        flex: 1,
        fontSize: 13,
        fontFamily: 'Plus Jakarta Sans',
      },
      webMapPlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.four,
        gap: Spacing.two,
      },
      webMapText: {
        fontSize: 14,
        fontFamily: 'Plus Jakarta Sans',
        textAlign: 'center',
      },
      webMapAddress: {
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'Plus Jakarta Sans',
        textAlign: 'center',
      },
      cardLocationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
      },
      cardLocationText: {
        fontSize: 11,
        fontFamily: 'Plus Jakarta Sans',
      },
    }),

    settings: StyleSheet.create({
      card: {
        padding: Spacing.four,
        borderRadius: 16,
        borderWidth: 1,
      },
      cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.three,
        marginBottom: Spacing.four,
      },
      avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
      },
      avatarText: {
        fontSize: 18,
        fontWeight: '700',
        fontFamily: 'Quicksand',
      },
      cardHeaderTitle: {
        flex: 1,
      },
      cardTitle: {
        fontSize: 20,
        fontWeight: '700',
        fontFamily: 'Quicksand',
      },
      cardSubtitle: {
        fontSize: 13,
        fontFamily: 'Plus Jakarta Sans',
        marginTop: 1,
      },
      form: {
        gap: Spacing.three,
      },
      btnRow: {
        marginTop: Spacing.one,
        flexDirection: 'row',
      },
    }),
  };
}
