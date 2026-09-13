import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../lib/useAuth";
import { colors } from "../lib/theme";
import type { Announcement } from "../lib/types";

export default function NotificationsScreen() {
  const { user, profile, refreshProfile } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data }) => {
        setAnnouncements((data ?? []) as Announcement[]);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .update({ notifications_last_seen_at: new Date().toISOString() })
      .eq("id", user.id)
      .then(() => refreshProfile());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const lastSeen = profile?.notifications_last_seen_at;

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!profile?.subscribed_to_updates && (
        <Text style={styles.hint}>
          You're not subscribed to updates yet. Turn it on from your Profile tab to get notified
          automatically next time.
        </Text>
      )}

      {announcements.length === 0 ? (
        <Text style={styles.empty}>No notifications yet.</Text>
      ) : (
        <FlatList
          data={announcements}
          keyExtractor={(a) => String(a.id)}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          renderItem={({ item }) => {
            const isNew = lastSeen ? new Date(item.created_at) > new Date(lastSeen) : false;
            return (
              <View style={[styles.card, isNew && styles.cardNew]}>
                <Text style={styles.message}>{item.message}</Text>
                <Text style={styles.date}>{new Date(item.created_at).toLocaleString("en-NG")}</Text>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { justifyContent: "center", alignItems: "center" },
  hint: { color: colors.textMuted, fontSize: 12, padding: 16 },
  empty: { color: colors.textMuted, textAlign: "center", marginTop: 24 },
  card: { backgroundColor: colors.surface, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: "transparent" },
  cardNew: { borderColor: colors.border },
  message: { color: "#E5E7EB", fontSize: 13, marginBottom: 6 },
  date: { color: colors.textMuted, fontSize: 11 },
});
