import { Shield, Lock, Key, Download, Smartphone, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  const features = [
    {
      icon: Shield,
      title: "Military-Grade Encryption",
      description: "Your passwords are protected with AES-256 encryption, the same standard used by governments and banks.",
    },
    {
      icon: Key,
      title: "Password Generator",
      description: "Create strong, unique passwords with our advanced generator featuring customizable security options.",
    },
    {
      icon: Lock,
      title: "Secure Storage",
      description: "All your credentials are encrypted and stored securely. Only you can access your passwords.",
    },
    {
      icon: Download,
      title: "Export & Backup",
      description: "Easily export your data for backup or migration. Your data remains yours, always.",
    },
    {
      icon: Smartphone,
      title: "Cross-Platform",
      description: "Access your passwords from any device with our responsive web application.",
    },
    {
      icon: Globe,
      title: "Open Source",
      description: "Built with transparency in mind. You can verify our security practices yourself.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-16 sm:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-8">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
                <Shield className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              SecurePass Manager
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              The most secure and user-friendly password manager for individuals and teams. 
              Keep your digital life safe with military-grade encryption.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="text-lg px-8 py-3"
                onClick={() => window.location.href = "/"}
                data-testid="login-btn"
              >
                Get Started Free
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-3"
                data-testid="learn-more-btn"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Choose SecurePass?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We've built the most comprehensive password management solution with security, 
            usability, and privacy at its core.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary/5 border-t border-border">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Secure Your Digital Life?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust SecurePass to keep their passwords safe. 
            Start your free account today.
          </p>
          <Button 
            size="lg" 
            className="text-lg px-8 py-3"
            onClick={() => window.location.href = "/"}
            data-testid="cta-login-btn"
          >
            Start Using SecurePass
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Shield className="w-6 h-6 text-primary" />
              <span className="font-semibold">SecurePass Manager</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built with security and privacy in mind. © 2024 SecurePass Manager.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
