import { Injectable } from '@angular/core';
import { ToastService } from '../toast/service/toast.service';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private currentAudio: HTMLAudioElement | null = null;

  constructor(
    private toast: ToastService,
  ) {}

  /**
   * Hàm đọc văn bản
   * @param text Từ vựng hoặc câu cần đọc
   */
  speak(text: string): void {
    if (!text) return;

    // BƯỚC 1: Dừng mọi âm thanh đang phát (để không bị đọc chồng chéo)
    this.stop();

    // BƯỚC 2: Thử phát bằng link Google (Ưu tiên)
    this.playFromUrl(text);
  }

  /**
   * Dừng đọc ngay lập tức
   */
  stop(): void {
    // Dừng Web Speech API
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    // Dừng thẻ Audio
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
  }

  // --- PRIVATE METHODS ---
  private playFromUrl(text: string): void {
    // Sử dụng endpoint 'gtx' và domain 'googleapis' (Ổn định hơn tw-ob)
    const url = `https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=en&q=${encodeURIComponent(text)}`;

    this.currentAudio = new Audio(url);

    // Cố gắng phát âm thanh
    this.currentAudio.play()
      .then(() => {
        // Thành công: Không cần làm gì thêm
        console.log('Đang phát từ Google Audio');
      })
      .catch((error) => {
        // Thất bại (Lỗi 403, 404 hoặc trình duyệt chặn Autoplay)
        this.toast.showWarning(`Google Audio lỗi, chuyển sang Web Speech API: ${error}`);

        // Gọi phương án dự phòng
        this.playFallbackBrowser(text);
      });
  }

  private playFallbackBrowser(text: string): void {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US'; // Giọng Mỹ
      utterance.rate = 0.9;     // Tốc độ đọc
      window.speechSynthesis.speak(utterance);
    } else {
      console.error('Trình duyệt không hỗ trợ đọc âm thanh.');
    }
  }
}