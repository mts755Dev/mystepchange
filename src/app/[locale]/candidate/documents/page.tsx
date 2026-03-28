"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { DashboardLayout } from "@/components/shared/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { getSession } from "@/lib/auth";
import { documentStorage } from "@/lib/storage";
import { nanoid, formatDate } from "@/lib/utils";
import type { Document, DocumentType } from "@/types";
import { toast } from "sonner";
import {
  LayoutDashboard, User, FileText, MessageSquare, Briefcase,
  Upload, CheckCircle, Clock, Shield, Eye, EyeOff, FileUp
} from "lucide-react";

const DOC_TYPES: { value: DocumentType; label: string }[] = [
  { value: "cv", label: "CV / Resume" },
  { value: "certificate", label: "Certificate" },
  { value: "diploma", label: "Diploma" },
  { value: "language_cert", label: "Language Certificate" },
  { value: "other", label: "Other" },
];

export default function CandidateDocuments() {
  const locale = useLocale();
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [userId, setUserId] = useState("");
  const [docType, setDocType] = useState<DocumentType>("cv");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const navItems = [
    { label: "Dashboard", href: `/${locale}/candidate`, icon: LayoutDashboard },
    { label: "My Profile", href: `/${locale}/candidate/profile`, icon: User },
    { label: "Documents", href: `/${locale}/candidate/documents`, icon: FileText },
    { label: "Messages", href: `/${locale}/candidate/messages`, icon: MessageSquare },
    { label: "Job Matches", href: `/${locale}/candidate/matches`, icon: Briefcase },
  ];

  const loadDocs = (uid: string) => {
    const docs = documentStorage.getByUserId(uid);
    setDocuments(docs);
  };

  useEffect(() => {
    const session = getSession();
    if (!session || !["candidate", "apprentice", "skilled_worker"].includes(session.role)) {
      router.push(`/${locale}/login`);
      return;
    }
    setUserId(session.userId);
    loadDocs(session.userId);
  }, [locale, router]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("File too large. Maximum size is 5MB.");
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const fileData = reader.result as string;
      const doc: Document = {
        id: nanoid(),
        userId,
        type: docType,
        fileName: file.name,
        anonymizedFileName: `document_${Date.now()}.${file.name.split(".").pop()}`,
        fileData,
        isVerified: false,
        isAnonymized: true,
        uploadedAt: new Date().toISOString(),
      };
      documentStorage.create(doc);
      loadDocs(userId);
      setUploading(false);
      toast.success("Document uploaded successfully!");
      if (fileRef.current) fileRef.current.value = "";
    };
    reader.readAsDataURL(file);
  };

  return (
    <DashboardLayout navItems={navItems} title="Documents" role="candidate">
      <div className="max-w-3xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Documents</h2>
          <p className="text-sm text-gray-500 mt-1">Upload your CV, certificates, and other documents. They are anonymized before sharing with employers.</p>
        </div>

        {/* Upload Area */}
        <Card className="border-2 border-dashed border-blue-200 bg-blue-50/30">
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <FileUp className="w-10 h-10 text-blue-400 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-800">Upload Document</h3>
              <p className="text-sm text-gray-500">PDF, DOC, DOCX, JPG, PNG — max 5MB</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="space-y-1.5 flex-1">
                <Label>Document Type</Label>
                <Select value={docType} onValueChange={(v) => setDocType(v as DocumentType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DOC_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="msc"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex-shrink-0"
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? "Uploading..." : "Choose File"}
              </Button>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="hidden"
              onChange={handleFileUpload}
            />
          </CardContent>
        </Card>

        {/* Privacy Note */}
        <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-100 rounded-lg">
          <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-800">Document Privacy Protection</p>
            <p className="text-sm text-green-700 mt-0.5">
              All documents are anonymized before being shared with employers. Your name and personal identifiers are removed. Only MSC Admin can see your full documents.
            </p>
          </div>
        </div>

        {/* Document List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Uploaded Documents ({documents.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No documents uploaded yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border">
                    <FileText className="w-8 h-8 text-blue-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{doc.fileName}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {DOC_TYPES.find((t) => t.value === doc.type)?.label}
                        </Badge>
                        <span className="text-xs text-gray-400">{formatDate(doc.uploadedAt, locale)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {doc.isVerified ? (
                        <Badge variant="success" className="gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="warning" className="gap-1">
                          <Clock className="w-3 h-3" />
                          Pending
                        </Badge>
                      )}
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <EyeOff className="w-3.5 h-3.5" />
                        Anonymized
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
