import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/Layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Download, Upload, FileText, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Password, Category } from "@shared/schema";

interface ImportResult {
  success: boolean;
  imported: number;
  errors: string[];
}

export default function ImportExport() {
  const { toast } = useToast();
  const [importData, setImportData] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const { data: passwords = [] } = useQuery<Password[]>({
    queryKey: ["/api/passwords"],
    retry: false,
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    retry: false,
  });

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      const response = await fetch("/api/export", {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Export failed");
      }
      
      let blob: Blob;
      let filename: string;
      
      if (format === 'json') {
        blob = await response.blob();
        filename = "securepass-export.json";
      } else {
        // Convert JSON to CSV
        const data = await response.json();
        const csvContent = convertToCSV(data.passwords);
        blob = new Blob([csvContent], { type: 'text/csv' });
        filename = "securepass-export.csv";
      }
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Success",
        description: `Data exported as ${format.toUpperCase()} successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    }
  };

  const convertToCSV = (passwords: any[]) => {
    const headers = ['Website', 'Username', 'Password', 'Notes', 'Category'];
    const rows = passwords.map(p => [
      p.website,
      p.username,
      p.password,
      p.notes || '',
      p.category || ''
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${(field || '').toString().replace(/"/g, '""')}"`).join(','))
      .join('\n');
    
    return csvContent;
  };

  const handleImport = async () => {
    if (!importData.trim()) {
      toast({
        title: "Error",
        description: "Please enter data to import",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    setImportResult(null);

    try {
      let parsedData;
      
      // Try to parse as JSON first
      try {
        parsedData = JSON.parse(importData);
      } catch {
        // If JSON parsing fails, try to parse as CSV
        parsedData = parseCSV(importData);
      }

      if (!parsedData || !Array.isArray(parsedData.passwords)) {
        throw new Error("Invalid data format");
      }

      let imported = 0;
      const errors: string[] = [];

      // Import each password
      for (const passwordData of parsedData.passwords) {
        try {
          // Validate required fields
          if (!passwordData.website || !passwordData.username || !passwordData.password) {
            errors.push(`Skipped entry: Missing required fields (website: ${passwordData.website}, username: ${passwordData.username})`);
            continue;
          }

          const response = await fetch("/api/passwords", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              website: passwordData.website,
              username: passwordData.username,
              password: passwordData.password,
              notes: passwordData.notes || "",
              categoryId: "", // Will need to map categories later
            }),
          });

          if (response.ok) {
            imported++;
          } else {
            errors.push(`Failed to import ${passwordData.website}: ${response.statusText}`);
          }
        } catch (error) {
          errors.push(`Error importing ${passwordData.website}: ${error}`);
        }
      }

      setImportResult({
        success: imported > 0,
        imported,
        errors,
      });

      if (imported > 0) {
        toast({
          title: "Import Completed",
          description: `Successfully imported ${imported} password${imported === 1 ? '' : 's'}`,
        });
      }
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Failed to parse or import data. Please check the format.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const parseCSV = (csvData: string) => {
    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase());
    
    const passwords = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.replace(/"/g, '').trim());
      const password: any = {};
      
      headers.forEach((header, index) => {
        if (header === 'website') password.website = values[index];
        else if (header === 'username') password.username = values[index];
        else if (header === 'password') password.password = values[index];
        else if (header === 'notes') password.notes = values[index];
        else if (header === 'category') password.category = values[index];
      });
      
      return password;
    });

    return { passwords };
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setImportData(content);
    };
    reader.readAsText(file);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-semibold mb-2" data-testid="import-export-title">Import & Export</h2>
          <p className="text-muted-foreground">Backup your passwords or import from other sources</p>
        </div>

        <Tabs defaultValue="export" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export" data-testid="export-tab">Export Data</TabsTrigger>
            <TabsTrigger value="import" data-testid="import-tab">Import Data</TabsTrigger>
          </TabsList>

          {/* Export Tab */}
          <TabsContent value="export" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Export Your Passwords
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      <h3 className="font-medium">JSON Format</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Complete backup including categories and metadata. Best for SecurePass.
                    </p>
                    <Button 
                      onClick={() => handleExport('json')} 
                      className="w-full"
                      data-testid="export-json-btn"
                    >
                      Export as JSON
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      <h3 className="font-medium">CSV Format</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Simple spreadsheet format. Compatible with Excel and other tools.
                    </p>
                    <Button 
                      onClick={() => handleExport('csv')} 
                      variant="outline" 
                      className="w-full"
                      data-testid="export-csv-btn"
                    >
                      Export as CSV
                    </Button>
                  </div>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Security Notice</AlertTitle>
                  <AlertDescription>
                    Exported files contain your passwords in plain text. Store them securely and delete them after use.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-semibold text-primary" data-testid="total-passwords-count">
                      {passwords.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Passwords</div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-primary" data-testid="total-categories-count">
                      {categories.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Categories</div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-primary">
                      {passwords.filter(p => p.isFavorite).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Favorites</div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-primary">
                      {passwords.filter(p => (p.strength || 0) >= 3).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Strong</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Import Tab */}
          <TabsContent value="import" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Import Passwords
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Import Guidelines</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1 mt-2">
                      <li>Supported formats: JSON (SecurePass export) or CSV</li>
                      <li>CSV requires columns: Website, Username, Password, Notes, Category</li>
                      <li>Duplicate entries will be created as separate passwords</li>
                      <li>Categories will need to be reassigned after import</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="file-upload">Upload File</Label>
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".json,.csv,.txt"
                      onChange={handleFileUpload}
                      className="mt-2"
                      data-testid="file-upload-input"
                    />
                  </div>

                  <div className="text-center text-muted-foreground">
                    <span>or</span>
                  </div>

                  <div>
                    <Label htmlFor="import-data">Paste Data</Label>
                    <Textarea
                      id="import-data"
                      placeholder="Paste your JSON or CSV data here..."
                      value={importData}
                      onChange={(e) => setImportData(e.target.value)}
                      rows={10}
                      className="mt-2 font-mono text-sm"
                      data-testid="import-data-textarea"
                    />
                  </div>

                  <Button
                    onClick={handleImport}
                    disabled={isImporting || !importData.trim()}
                    className="w-full"
                    data-testid="import-btn"
                  >
                    {isImporting ? "Importing..." : "Import Passwords"}
                  </Button>
                </div>

                {importResult && (
                  <Alert className={importResult.success ? "border-green-200 bg-green-50 dark:bg-green-950/50" : "border-red-200 bg-red-50 dark:bg-red-950/50"}>
                    {importResult.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertTitle>
                      {importResult.success ? "Import Completed" : "Import Failed"}
                    </AlertTitle>
                    <AlertDescription>
                      <div className="space-y-2">
                        {importResult.success && (
                          <p>Successfully imported {importResult.imported} password{importResult.imported === 1 ? '' : 's'}.</p>
                        )}
                        {importResult.errors.length > 0 && (
                          <div>
                            <p className="font-medium mb-1">Issues encountered:</p>
                            <ul className="list-disc list-inside space-y-1">
                              {importResult.errors.slice(0, 5).map((error, index) => (
                                <li key={index} className="text-sm">{error}</li>
                              ))}
                              {importResult.errors.length > 5 && (
                                <li className="text-sm">... and {importResult.errors.length - 5} more</li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Sample Format Card */}
            <Card>
              <CardHeader>
                <CardTitle>Sample CSV Format</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-md">
                  <code className="text-sm">
                    Website,Username,Password,Notes,Category<br/>
                    "Gmail","john@example.com","mypassword123","Personal email","Email"<br/>
                    "Facebook","johndoe","anotherpass456","Social media account","Social Media"<br/>
                    "GitHub","john_developer","devpass789","Work repository","Work"
                  </code>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
