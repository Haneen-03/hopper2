import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ImageBackground,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const Signup: React.FC = () => {
  const navigation = useNavigation();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <ImageBackground
      source={require("../../assets/images/thefillbac.png")} // تأكد من المسار الصحيح للصورة
      style={styles.container} // تعيين الخلفية للصورة
    >
      <ScrollView contentContainerStyle={styles.innerContainer}>
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={fullName}
            onChangeText={setFullName}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("Dashboard")}
          >
            <Text style={styles.buttonText}>SIGN UP</Text>
          </TouchableOpacity>

          <View style={styles.loginLink}>
            <Text style={styles.text}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.linkText}>SIGN IN</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // تعيين الحجم الكامل للصورة
    justifyContent: "center",
    alignItems: "center",
  },
  innerContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    padding: 20,
    paddingTop: 350,
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "rgba(255, 255, 255, 0.8)", // خلفية شفافة
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingLeft: 10,
  },
  button: {
    backgroundColor: "#001D75",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  loginLink: {
    marginTop: 15,
    flexDirection: "row",
    justifyContent: "center",
  },
  text: {
    fontSize: 14,
    color: "#888",
  },
  linkText: {
    fontSize: 14,
    color: "#001D75",
  },
});

export default Signup;
