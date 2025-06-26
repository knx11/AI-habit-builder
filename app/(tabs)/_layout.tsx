// ... previous code remains the same ...
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => router.push('/settings')}
              style={{ marginRight: 16 }}
            >
              <Settings size={24} color={colors.text} />
            </TouchableOpacity>
          ),
// ... rest of the code remains the same ...