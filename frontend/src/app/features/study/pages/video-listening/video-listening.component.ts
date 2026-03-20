import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';

// --- MODELS ---
interface JpToken {
  text: string;
  furigana?: string;
  romaji?: string;
  meaning?: string;
  type?: string;     // Danh từ, Động từ, space...
  grammar?: string;  // Cấu trúc ngữ pháp
  baseForm?: string; // Thể từ điển
}

interface TranscriptLine {
  start: number;
  end: number;
  vi: string;
  jp_tokens: JpToken[];
}

@Component({
  selector: 'app-video-listening',
  templateUrl: './video-listening.component.html',
  styleUrls: ['./video-listening.component.scss']
})
export class VideoListeningComponent {
  
  @ViewChild('videoPlayer') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('transcriptContainer') transcriptContainer!: ElementRef<HTMLDivElement>;

  videoSrc = 'assets/video/Kusuriya_no_Hitorigoto_14.mp4'; // Đảm bảo bạn có file này hoặc đổi link
  
  // Trạng thái Tooltip
  hoveredToken: JpToken | null = null;
  tooltipPos = { x: 0, y: 0 };
  isTooltipVisible = false;

  currentLineIndex = -1;

  constructor(
      private http: HttpClient
    ) {}
  ngOnInit(): void {
    
    this.http.get<TranscriptLine[]>('assets/_14v1.json').subscribe(data => {
      this.transcriptData = data;
    });
  }
  // Dữ liệu mẫu từ JSON bạn cung cấp
  transcriptData: TranscriptLine[] = [
    {
      start: 0,
      end: 5,
      vi: "Tôi lấy cái này được không?",
      jp_tokens: [
        {
          text: "これ",
          furigana: "これ",
          romaji: "kore",
          meaning: "Cái này",
          type: "Đại từ",
          grammar: ""
        },
        {
          text: " ",
          type: "space"
        },
        {
          text: "もらって",
          furigana: "もらって",
          romaji: "moratte",
          meaning: "nhận, lấy",
          baseForm: "もらう (Hán tự: 貰う)",
          type: "Động từ",
          grammar: "V-te (Thể Te)"
        },
        {
          text: " ",
          type: "space"
        },
        {
          text: "いい",
          furigana: "いい", // Giả sử giống nhau vì là Kana
          romaji: "ii",
          meaning: "được, tốt",
          type: "Tính từ đuôi i",
          grammar: ""
        },
        {
          text: " ",
          type: "space"
        },
        {
          text: "ですか",
          furigana: "ですか",
          romaji: "desuka",
          meaning: "phải không?",
          type: "Trợ từ nghi vấn",
          grammar: "Cấu trúc xin phép: V-te + ii desu ka"
        }
      ]
    },
    // Thêm một ví dụ có Kanji để test Furigana
    {
      start: 6,
      end: 10,
      vi: "Tiếng Nhật thật thú vị.",
      jp_tokens: [
        { text: "日本語", furigana: "にほんご", romaji: "nihongo", meaning: "Tiếng Nhật", type: "Danh từ" },
        { text: "は", furigana: "は", romaji: "wa", meaning: "thì/là", type: "Trợ từ" },
        { text: "面白", furigana: "おもしろ", romaji: "omoshiro", meaning: "thú vị", type: "Tính từ" },
        { text: "い", furigana: "い", romaji: "i", type: "" },
        { text: "です", furigana: "です", romaji: "desu", meaning: "là", type: "Copula" }
      ]
    }
  ];

  // --- LOGIC HOVER TOOLTIP ---

  onTokenHover(event: MouseEvent, token: JpToken) {
    if (token.type === 'space') return; // Bỏ qua khoảng trắng

    this.hoveredToken = token;
    this.isTooltipVisible = true;

    // Tính toán vị trí hiển thị Tooltip
    // Lấy tọa độ của từ đang hover
    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();

    // Hiển thị tooltip phía trên từ đó (cộng thêm scroll offset nếu có)
    this.tooltipPos = {
      x: rect.left + (rect.width / 2), // Căn giữa theo chiều ngang
      y: rect.top - 10 // Cách đỉnh của từ 10px
    };
  }

  onTokenLeave() {
    this.isTooltipVisible = false;
    this.hoveredToken = null;
  }

  // --- LOGIC VIDEO (Giữ nguyên từ bài trước) ---

  onTimeUpdate() {
    if (!this.videoElement) return;
    const currentTime = this.videoElement.nativeElement.currentTime;
    const activeIndex = this.transcriptData.findIndex(
      line => currentTime >= line.start && currentTime <= line.end
    );

    if (activeIndex !== -1 && activeIndex !== this.currentLineIndex) {
      this.currentLineIndex = activeIndex;
      this.scrollToActiveLine(activeIndex);
    }
  }

  seekTo(seconds: number) {
    if (this.videoElement) {
      this.videoElement.nativeElement.currentTime = seconds;
      this.videoElement.nativeElement.play();
    }
  }

  scrollToActiveLine(index: number) {
    if (!this.transcriptContainer) return;
    const container = this.transcriptContainer.nativeElement;
    const activeLine = document.getElementById('line-' + index);

    if (activeLine) {
      const lineTop = activeLine.offsetTop;
      const lineHeight = activeLine.clientHeight;
      const containerHeight = container.clientHeight;
      const scrollPosition = lineTop - (containerHeight / 2) + (lineHeight / 2);
      
      container.scrollTo({ top: scrollPosition, behavior: 'smooth' });
    }
  }
}