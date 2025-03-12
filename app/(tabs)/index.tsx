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

const Login: React.FC = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <ImageBackground
      source={require("../../assets/images/thefillbac.png")} // استخدم المسار الصحيح للصورة
      style={styles.container} // تأكد من أن الصورة تغطي الشاشة بالكامل
    >
      <ScrollView contentContainerStyle={styles.innerContainer}>
        <View style={styles.formWrapper}>
          <View style={styles.formContainer}>
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
            <View style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate("Dashboard")}
            >
              <Text style={styles.buttonText}>SIGN IN</Text>
            </TouchableOpacity>

            <View style={styles.signupLink}>
              <Text style={styles.text}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
                <Text style={styles.linkText}>SIGN UP</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // استخدام flex: 1 لجعل الخلفية تغطي الشاشة بالكامل
    justifyContent: "center",
    alignItems: "center",
  },
  innerContainer: {
    width: "100%", // زيادة العرض بالنسب المئوية أو يمكنك تحديد قيمة بالبيكسل مثل 500
    maxWidth: 500,
    flexGrow: 1,
    justifyContent: "flex-start", // استخدم flex-start لتحريك العناصر لأعلى
    alignItems: "center",
    padding: 20,
  },
  formWrapper: {
    flex: 1,
    justifyContent: "flex-start", // استخدم flex-start لمحاذاة العناصر أعلى
    alignItems: "center",
    width: "100%",
    paddingTop: 400, // زيادة المسافة من الأعلى
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "rgba(255, 255, 255, 0.7)", // جعل الخلفية شفافة
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
  forgotPassword: {
    marginBottom: 15,
    alignItems: "flex-end",
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#001D75",
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
  signupLink: {
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

export default Login;
