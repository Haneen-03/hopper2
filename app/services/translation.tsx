import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Clipboard,
  Alert
} from "react-native";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface Language {
  code: string;
  name: string;
}

// Define your app's navigation structure
type RootStackParamList = {
  Dashboard: undefined;
  // Add other routes as needed
};

// Create a typed navigation hook
type TranslationScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const TranslationPage: React.FC = () => {
  const navigation = useNavigation<TranslationScreenNavigationProp>();
  const [sourceText, setSourceText] = useState<string>("");
  const [translatedText, setTranslatedText] = useState<string>("");
  const [sourceLanguage, setSourceLanguage] = useState<string>("en");
  const [targetLanguage, setTargetLanguage] = useState<string>("ar");
  const [isTranslating, setIsTranslating] = useState<boolean>(false);

  // قائمة اللغات المتاحة
  const languages: Language[] = [
    { code: "en", name: "English" },
    { code: "ar", name: "Arabic" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "zh", name: "Chinese" },
    { code: "ru", name: "Russian" },
    { code: "ja", name: "Japanese" },
    { code: "hi", name: "Hindi" },
    { code: "tr", name: "Turkish" },
  ];

  // تبديل اللغات
  const swapLanguages = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    if (translatedText) {
      setSourceText(translatedText);
      setTranslatedText("");
    }
  };

  // دالة الترجمة (محاكاة API)
  const translateText = async () => {
    if (!sourceText.trim()) return;
    setIsTranslating(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const mockResult = `Translated: "${sourceText}" from ${
        languages.find((lang) => lang.code === sourceLanguage)?.name
      } to ${languages.find((lang) => lang.code === targetLanguage)?.name}`;
      setTranslatedText(mockResult);
    } catch (error) {
      console.error("Translation error:", error);
      setTranslatedText("Error occurred during translation. Please try again.");
    } finally {
      setIsTranslating(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (sourceText.trim()) {
        translateText();
      } else {
        setTranslatedText("");
      }
    }, 800);

    return () => clearTimeout(debounceTimer);
  }, [sourceText, sourceLanguage, targetLanguage]);

  // Handle copy to clipboard
  const copyToClipboard = () => {
    Clipboard.setString(translatedText);
    Alert.alert("Copied", "Translation copied to clipboard");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.formWrapper}>
        <Text style={styles.title}>Translation</Text>

        <View style={styles.languageSelectors}>
          <TextInput
            value={sourceLanguage}
            onChangeText={(text) => setSourceLanguage(text)}
            style={styles.input}
          />
          <TouchableOpacity style={styles.swapButton} onPress={swapLanguages}>
            <Text style={styles.swapButtonText}>⇄</Text>
          </TouchableOpacity>
          <TextInput
            value={targetLanguage}
            onChangeText={(text) => setTargetLanguage(text)}
            style={styles.input}
          />
        </View>

        <TextInput
          value={sourceText}
          onChangeText={(text) => setSourceText(text)}
          placeholder="Enter text to translate"
          style={styles.textarea}
          multiline={true}
        />

        <TextInput
          value={translatedText}
          placeholder="Translation will appear here"
          style={[styles.textarea, styles.translatedTextarea]}
          editable={false}
          multiline={true}
        />

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              setSourceText("");
              setTranslatedText("");
            }}
          >
            <Text style={styles.clearButtonText}>CLEAR</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.copyButton}
            onPress={copyToClipboard}
            disabled={!translatedText}
          >
            <Text style={styles.copyButtonText}>COPY</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate("Dashboard")}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>BACK</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  formWrapper: {
    width: "100%",
    maxWidth: 600,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#001D75",
    textAlign: "center",
    marginBottom: 20,
  },
  languageSelectors: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  input: {
    width: "48%",
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingLeft: 10,
  },
  swapButton: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    borderRadius: 50,
    padding: 10,
  },
  swapButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#001D75",
  },
  textarea: {
    height: 120,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 15,
    paddingLeft: 10,
    textAlignVertical: "top",
    padding: 10,
  },
  translatedTextarea: {
    backgroundColor: "#f9f9f9",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  clearButton: {
    backgroundColor: "#f44336",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  clearButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  copyButton: {
    backgroundColor: "#4caf50",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  copyButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  backButton: {
    backgroundColor: "#001D75",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default TranslationPage;