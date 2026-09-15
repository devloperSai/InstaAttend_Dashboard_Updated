import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { authService } from "../api/services/auth.service";

// Image lives in /public, so it's served from the site root at runtime —
// no import needed, just reference the path directly. Vite copies
// everything in /public as-is, so this works in both dev and build.
const loginBgUrl = "/Login_background_2.png";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import UnauthorizedModal from "../components/ui/UnauthorizedModel";

const loginFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showUnauthorized, setShowUnauthorized] = useState(false);
  const [loginError, setLoginError] = useState("");

  const form = useForm({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  if (authService.isAuthenticated()) {
    return <Navigate to="/" />;
  }

  const onSubmit = async (data) => {
    try {
      setIsLoggingIn(true);
      setLoginError("");
      const result = await authService.login(data.email, data.password);

      if (result?.unauthorized) {
        setShowUnauthorized(true);
        return;
      }

      if (result?.success) {
        navigate("/", { replace: true });
      }
    } catch (error) {
      console.error("Login failed", error);
      setLoginError(
        error.response?.data?.message ||
          error.message ||
          "Unable to sign in. Please check your credentials and try again.",
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const togglePassword = () => setShowPassword(!showPassword);

  return (
    <div className="relative min-h-screen flex items-center justify-center lg:justify-start overflow-hidden">
      {/* Background photo — kept mostly crisp (only a whisper of blur) so
          the scene reads clearly, the way a premium product screen would.
          Data/text on it is intentionally still slightly visible, per design. */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute inset-0 scale-105 blur-[6px]"
          style={{
            backgroundImage: `url(${loginBgUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        {/* Depth gradient — dark navy/green tint, heavier at top & bottom,
            lighter through the middle, for a cinematic, professional feel
            (this is what the fog-free "advanced" look comes from, not blur). */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(6,20,17,0.72) 0%, rgba(6,20,17,0.42) 38%, rgba(6,20,17,0.5) 62%, rgba(6,20,17,0.78) 100%)",
          }}
        />
        {/* Soft radial glow centered behind the card — brand-tinted light
            source, mimicking the reference's focal spotlight on the modal */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 22% 42%, rgba(16,185,129,0.22) 0%, rgba(16,185,129,0.08) 32%, rgba(0,0,0,0) 60%)",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md px-4 lg:pl-20 lg:pr-4 lg:ml-0">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.75)]">
            Insta Attend
          </h1>
          <p className="text-white/90 mt-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.75)]">
            HR Management System
          </p>
        </div>

        <Card className="w-full border border-white/40 backdrop-blur-xl bg-card/90 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)_inset] rounded-2xl">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {loginError && (
                  <p
                    role="alert"
                    className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                  >
                    {loginError}
                  </p>
                )}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            placeholder="email@company.com"
                            {...field}
                            className="pl-10"
                          />
                        </FormControl>
                        <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                            className="pl-10"
                          />
                        </FormControl>
                        <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1 h-8 w-8 p-0"
                          onClick={togglePassword}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400" />
                          )}
                          <span className="sr-only">
                            {showPassword ? "Hide password" : "Show password"}
                          </span>
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="remember"
                      className="h-4 w-4 rounded border-gray-300 text-instattend-500 focus:ring-instattend-500"
                    />
                    <label htmlFor="remember" className="text-sm text-gray-700">
                      Remember me
                    </label>
                  </div>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-instattend-600 hover:text-instattend-700"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-instattend-500 hover:bg-instattend-600"
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-4">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-instattend-600 hover:text-instattend-700 font-medium"
              >
                Create account
              </Link>
            </p>
          </CardFooter>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-white/90 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
            © {new Date().getFullYear()} Insta Attend Inc. All rights reserved.
          </p>
        </div>

        {/*Unauthorized Dialoge*/}
        <UnauthorizedModal
          isOpen={showUnauthorized}
          onClose={() => setShowUnauthorized(false)}
        />
      </div>
    </div>
  );
};

export default Login;
