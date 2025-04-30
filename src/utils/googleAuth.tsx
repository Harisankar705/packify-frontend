import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext"; 
import { useToast } from "@/hooks/use-toast";

interface GoogleAuthProps {
  authType: "login" | "signup";
}

export const GoogleAuth: React.FC<GoogleAuthProps> = ({ authType }) => {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      const credential = credentialResponse.credential;

      if (!credential) {
        toast({
          title: "Error",
          description: "Google authentication failed: No token received.",
          variant: "destructive",
        });
        return;
      }

      const decoded = jwtDecode(credential);
      console.log("Decoded Google User:", decoded);

      await googleLogin(credential);

      toast({
        title: "Success",
        description: `Google ${authType} successful!`,
      });

      
      if (authType === "signup") {
        navigate("/onboarding"); 
      } else {
        navigate("/"); 
      }

    } catch (error) {
      console.error("Google login error:", error);
      toast({
        title: "Error",
        description: "Google login failed.",
        variant: "destructive",
      });
    }
  };

  const handleGoogleFailure = () => {
    toast({
      title: "Error",
      description: "Google Sign-in was cancelled or failed.",
      variant: "destructive",
    });
  };

  return <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleFailure} />;
};
