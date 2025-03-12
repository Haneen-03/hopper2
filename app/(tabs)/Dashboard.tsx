import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const Login: React.FC = () => {
  const navigation = useNavigation();

  return (
    <ImageBackground
      source={require("../../assets/images/thefillbac.png")} // استخدم المسار الصحيح للصورة
      style={styles.container} // تأكد من أن الصورة تغطي الشاشة بالكامل
    >
      <ScrollView contentContainerStyle={styles.innerContainer}>
        <View style={styles.formWrapper}>
          <View style={styles.formContainer}>
            {/* زر تسجيل الدخول */}
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate("index")}
            >
              <Text style={styles.buttonText}>SIGN IN</Text>
            </TouchableOpacity>

            {/* زر إنشاء حساب */}
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate("explore")}
            >
              <Text style={styles.buttonText}>SIGN UP</Text>
            </TouchableOpacity>
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
  button: {
    backgroundColor: "#001D75",
    paddingVertical: 18, // زيادة العرض العمودي
    paddingHorizontal: 65, // زيادة العرض الأفقي
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20, // إضافة المسافة بين الأزرار
  },
  buttonText: {
    color: "#fff",
    fontSize: 20, // زيادة حجم الخط داخل الزر
    fontWeight: "bold",
  },
});

export default Login;
