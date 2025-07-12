
import { useState } from "react";
import { AuthForm } from "@/components/AuthForm";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface RegisterPageProps {
  onRegister: (user: any) => void;
}

export function RegisterPage({ onRegister }: RegisterPageProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (email: string, password: string, name?: string) => {
    setLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock registration - in real app, this would be an API call
      const mockUser = {
        id: Date.now().toString(),
        name: name || 'New User',
        email: email,
        location: '',
        avatar: '',
        skillsOffered: [],
        skillsWanted: [],
        availability: 'flexible',
        isPublic: true,
      };

      onRegister(mockUser);
      toast({
        title: "Account created!",
        description: "Welcome to SkillSwap! Please complete your profile.",
      });
      navigate('/profile');
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      type="register"
      onSubmit={handleRegister}
      loading={loading}
      error={error}
    />
  );
}
