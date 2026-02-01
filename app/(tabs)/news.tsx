import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Linking,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useTheme } from "../../src/context/ThemeContext";

interface NewsArticle {
  id: string;
  guid: string;
  imageurl: string;
  title: string;
  body: string;
  url: string;
  source_info: {
    name: string;
  };
  published_on: number;
}

export default function NewsScreen() {
  const { theme } = useTheme();

  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const res = await axios.get(
        "https://min-api.cryptocompare.com/data/v2/news/?lang=EN",
      );
      setNews(res.data.Data);
    } catch (e) {
      console.error("News Fetch Error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNews();
  };

  const renderNewsItem = ({ item }: { item: NewsArticle }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.card, { backgroundColor: theme.cardColor }]}
      onPress={() => Linking.openURL(item.url)}
    >
      <Image source={{ uri: item.imageurl }} style={styles.image} />
      <View style={styles.content}>
        <View style={styles.sourceRow}>
          <Text style={styles.sourceText}>{item.source_info.name}</Text>
          <Text style={styles.dateText}>
            {new Date(item.published_on * 1000).toLocaleDateString()}
          </Text>
        </View>
        <Text
          style={[styles.title, { color: theme.textColor }]}
          numberOfLines={2}
        >
          {item.title}
        </Text>
        <Text style={styles.bodyText} numberOfLines={3}>
          {item.body}
        </Text>
        <View style={styles.footer}>
          <Text style={{ color: "#007AFF", fontWeight: "bold" }}>
            Read More
          </Text>
          <Ionicons name="arrow-forward" size={16} color="#007AFF" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.textColor }]}>
          Latest Insights 📰
        </Text>
        <Text style={{ color: "#888" }}>Stay updated with the market</Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={{ marginTop: 10, color: theme.textColor }}>
            Fetching news...
          </Text>
        </View>
      ) : (
        <FlatList
          data={news}
          keyExtractor={(item) => item.id || item.guid}
          renderItem={renderNewsItem}
          contentContainerStyle={{ padding: 20 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#007AFF"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 20, marginBottom: 10 },
  headerTitle: { fontSize: 28, fontWeight: "bold" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    borderRadius: 20,
    marginBottom: 20,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  image: { width: "100%", height: 180, resizeMode: "cover" },
  content: { padding: 15 },
  sourceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sourceText: { color: "#007AFF", fontWeight: "bold", fontSize: 12 },
  dateText: { color: "#888", fontSize: 11 },
  title: { fontSize: 17, fontWeight: "bold", lineHeight: 22 },
  bodyText: { color: "#777", fontSize: 13, marginTop: 8, lineHeight: 18 },
  footer: { flexDirection: "row", alignItems: "center", marginTop: 15, gap: 5 },
});
