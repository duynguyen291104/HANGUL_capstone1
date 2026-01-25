'use client';

import React, { useState } from 'react';
import { Upload, FileText, Download, AlertCircle, CheckCircle2, XCircle, Database, BookOpen, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Label } from '../../components/ui/label';
import { parseVocabularyData, parseCSVData } from '../../utils/import-parser';
import { useVocabularyStore } from '../../stores/vocabulary';
import { sampleTSVData, sampleVocabulary } from '../../data/sample-vocab';
import { TOPIK1_VOCABULARY } from '../../data/vocabulary';
import { generateId } from '../../lib/utils';

export default function ImportPage() {
  const [importData, setImportData] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<any>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [preloadStatus, setPreloadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const { addVocabulary, getVocabularyCount } = useVocabularyStore();
  const currentVocabCount = getVocabularyCount();

  const handlePreloadTOPIK1 = async () => {
    setPreloadStatus('loading');
    try {
      // Convert TOPIK1_VOCABULARY to the correct format
      const vocabItems = TOPIK1_VOCABULARY.map(word => ({
        id: generateId(),
        ko: word.korean,
        vi: word.vietnamese,
        tags: word.category ? [word.category] : [],
        addedAt: Date.now(),
        srsLevel: 0,
        nextReview: Date.now(),
        correctStreak: 0,
        totalReviews: 0
      }));

      await addVocabulary(vocabItems);
      setPreloadStatus('success');
      
      // Auto hide success message after 3 seconds
      setTimeout(() => setPreloadStatus('idle'), 3000);
    } catch (error) {
      console.error('Failed to preload TOPIK 1 vocabulary:', error);
      setPreloadStatus('error');
      setTimeout(() => setPreloadStatus('idle'), 3000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Import từ vựng</h1>
        <p className="text-muted-foreground">
          Thêm từ vựng vào thư viện của bạn. Hiện tại có <strong>{currentVocabCount}</strong> từ vựng.
        </p>
      </div>

      {/* TOPIK 1 Pre-load Section */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500 text-white">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-blue-800">TOPIK 1 Vocabulary Pack</CardTitle>
              <CardDescription className="text-blue-600">
                {TOPIK1_VOCABULARY.length} từ vựng TOPIK 1 được tuyển chọn kỹ lưỡng
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-blue-700">
              <p className="font-semibold mb-2">Bao gồm các chủ đề:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <span>• Từ vựng cơ bản</span>
                <span>• Gia đình & mối quan hệ</span>
                <span>• Thức ăn & đồ uống</span>
                <span>• Giao thông & du lịch</span>
                <span>• Thời gian & địa điểm</span>
                <span>• Công việc & giáo dục</span>
                <span>• Sức khỏe & cơ thể</span>
                <span>• Hoạt động hàng ngày</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                onClick={handlePreloadTOPIK1}
                disabled={preloadStatus === 'loading'}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                size="lg"
              >
                {preloadStatus === 'loading' ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                    Đang tải...
                  </>
                ) : preloadStatus === 'success' ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Đã thêm thành công!
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Import {TOPIK1_VOCABULARY.length} từ vựng TOPIK 1
                  </>
                )}
              </Button>

              {preloadStatus === 'success' && (
                <span className="text-sm text-green-600 font-medium">
                  ✅ Đã thêm {TOPIK1_VOCABULARY.length} từ vào thư viện
                </span>
              )}
              
              {preloadStatus === 'error' && (
                <span className="text-sm text-red-600 font-medium">
                  ❌ Có lỗi xảy ra, vui lòng thử lại
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Tips */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-amber-800 text-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            💡 Hướng dẫn import
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-amber-700 space-y-3">
          <div>
            <p className="font-semibold mb-2">Tính năng hiện tại:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>✅ TOPIK 1 Pack:</strong> {TOPIK1_VOCABULARY.length} từ vựng được chọn lọc kỹ lưỡng</li>
              <li><strong>✅ Import tự động:</strong> Chỉ cần 1 click để có ngay bộ từ vựng hoàn chỉnh</li>
              <li><strong>✅ Phân loại theo chủ đề:</strong> Dễ dàng tìm kiếm và ôn tập</li>
              <li><strong>✅ Tích hợp SRS:</strong> Hệ thống lặp lại có khoảng cách thông minh</li>
            </ul>
          </div>
          
          <div>
            <p className="font-semibold mb-1">Sắp có thêm:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Import từ file CSV/Excel</li>
              <li>Import từ văn bản với nhiều format</li>
              <li>Chỉnh sửa và quản lý từ vựng chi tiết</li>
              <li>Export và backup dữ liệu</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}