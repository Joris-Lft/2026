import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/contexts/theme-context';
import { useThemeColor } from '@/hooks/use-theme-color';

export function ThemeToggle() {
  const { currentTheme, toggleTheme } = useTheme();
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: backgroundColor,
          top: insets.top + 10,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
      onPress={toggleTheme}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
      <View style={[styles.iconContainer, { borderColor: tintColor }]}>
        <IconSymbol
          name={currentTheme === 'dark' ? 'sun.max.fill' : 'moon.fill'}
          size={20}
          color={tintColor}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
});

