import { useState } from "react";
import { generatePassword, copyToClipboard } from "@/lib/crypto";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Copy, RefreshCw, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PasswordGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onPasswordGenerated?: (password: string) => void;
}

export function PasswordGenerator({ isOpen, onClose, onPasswordGenerated }: PasswordGeneratorProps) {
  const { toast } = useToast();
  const [password, setPassword] = useState("Kp9$mL2#nQ8@wX5!");
  const [options, setOptions] = useState({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
  });

  const generateNewPassword = () => {
    const newPassword = generatePassword(options);
    setPassword(newPassword);
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(password);
    if (success) {
      toast({
        title: "Copied!",
        description: "Password copied to clipboard",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to copy password",
        variant: "destructive",
      });
    }
  };

  const handleUsePassword = () => {
    onPasswordGenerated?.(password);
    onClose();
  };

  const updateOption = (key: keyof typeof options, value: boolean | number) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="password-generator-modal">
        <DialogHeader>
          <DialogTitle>Password Generator</DialogTitle>
          <DialogDescription>
            Generate a secure password with customizable options
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Generated Password Display */}
          <div className="relative">
            <Input
              type="text"
              value={password}
              readOnly
              className="font-mono text-lg pr-10"
              data-testid="generated-password"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              onClick={handleCopy}
              data-testid="copy-password-btn"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>

          {/* Length Slider */}
          <div className="space-y-2">
            <Label className="flex justify-between">
              Length: <span className="text-primary font-medium">{options.length}</span>
            </Label>
            <Slider
              value={[options.length]}
              onValueChange={([value]) => updateOption('length', value)}
              max={64}
              min={8}
              step={1}
              className="w-full"
              data-testid="length-slider"
            />
          </div>
          
          {/* Character Type Options */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="uppercase"
                checked={options.includeUppercase}
                onCheckedChange={(checked) => updateOption('includeUppercase', !!checked)}
                data-testid="uppercase-checkbox"
              />
              <Label htmlFor="uppercase" className="text-sm">Uppercase</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="lowercase"
                checked={options.includeLowercase}
                onCheckedChange={(checked) => updateOption('includeLowercase', !!checked)}
                data-testid="lowercase-checkbox"
              />
              <Label htmlFor="lowercase" className="text-sm">Lowercase</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="numbers"
                checked={options.includeNumbers}
                onCheckedChange={(checked) => updateOption('includeNumbers', !!checked)}
                data-testid="numbers-checkbox"
              />
              <Label htmlFor="numbers" className="text-sm">Numbers</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="symbols"
                checked={options.includeSymbols}
                onCheckedChange={(checked) => updateOption('includeSymbols', !!checked)}
                data-testid="symbols-checkbox"
              />
              <Label htmlFor="symbols" className="text-sm">Symbols</Label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={generateNewPassword}
              className="flex-1"
              data-testid="generate-new-btn"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Generate New
            </Button>
            <Button 
              onClick={handleCopy}
              variant="outline"
              data-testid="copy-btn"
            >
              <Copy className="w-4 h-4" />
            </Button>
            {onPasswordGenerated && (
              <Button 
                onClick={handleUsePassword}
                data-testid="use-password-btn"
              >
                Use This
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
