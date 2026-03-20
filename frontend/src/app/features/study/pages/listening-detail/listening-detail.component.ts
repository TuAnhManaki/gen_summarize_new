import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

interface TranscriptLine {
  start: number; // Thời gian bắt đầu (giây)
  end: number;   // Thời gian kết thúc
  en: string;
  jp: string;
  vi: string;
}

interface QuizData {
  question: string;
  options: { value: string; label: string }[];
  correctValue: string;
}

@Component({
  selector: 'app-listening-detail',
  templateUrl: './listening-detail.component.html',
  styleUrls: ['./listening-detail.component.scss'],
})
export class ListeningDetailComponent implements OnInit {
  showTranscript = false;

  lesson = {
    title: 'Luyện nghe giao tiếp',
    level: 'Beginner',
    duration: '45s',
    topic: 'Chào hỏi nơi làm việc',
    transcript: [
      { speaker: 'A', text: 'Hi, how are you today?' },
      { speaker: 'B', text: "I'm good, thanks. How about you?" },
      { speaker: 'A', text: 'Ready for the meeting?' },
      { speaker: 'B', text: "Yes, let's get started." },
    ],
  };

  constructor(private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  transcriptData: TranscriptLine[] = [];

  ngOnInit(): void {
    const lessonId = this.route.snapshot.queryParamMap.get('lessonId');
    console.log('Lesson ID:', lessonId);

    this.http.get<TranscriptLine[]>('assets/_14.json').subscribe(data => {
      this.transcriptData = data;
    });
  }

  // Lấy tham chiếu đến thẻ Video trong HTML
  @ViewChild('videoPlayer') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('transcriptContainer') transcriptContainer!: ElementRef<HTMLDivElement>;
  // 1. Video Data
  videoSrc = 'assets/video/Kusuriya_no_Hitorigoto_14.mp4'; // Đảm bảo bạn có file này hoặc đổi link
  posterSrc = 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1000';
// Tham chiếu đến thẻ <video> trong HTML

isTranscriptOpen = true;
currentLineIndex: number = -1; // -1 nghĩa là chưa có dòng nào active

// Dữ liệu Quiz
quiz: QuizData = {
  question: 'What is the 10-10-10 rule used for?',
  options: [
    { value: 'correct', label: 'Gain time perspective' },
    { value: 'wrong', label: 'Counting money' }
  ],
  correctValue: 'correct'
};
selectedQuizOption: string = '';
quizFeedback: { msg: string; type: 'success' | 'error' | null } = { msg: '', type: null };

// Dữ liệu Gap Fill
gapInput: string = '';
gapFeedback: { msg: string; type: 'success' | 'error' | 'hint' | null } = { msg: '', type: null };

// --- VIDEO LOGIC (QUAN TRỌNG) ---

// 1. Sự kiện chạy liên tục khi video phát
onTimeUpdate() {
  if (!this.videoElement) return;
  
  const currentTime = this.videoElement.nativeElement.currentTime;

  // Tìm dòng sub ứng với thời gian hiện tại
  const activeIndex = this.transcriptData.findIndex(
    line => currentTime >= line.start && currentTime <= line.end
  );

  // Chỉ cập nhật nếu dòng mới khác dòng cũ (Tránh render lại quá nhiều)
  if (activeIndex !== -1 && activeIndex !== this.currentLineIndex) {
    this.currentLineIndex = activeIndex;
    this.scrollToActiveLine(activeIndex);
  }
}

// 2. Click vào dòng sub -> Tua video đến đó
seekTo(seconds: number) {
  if (this.videoElement) {
    this.videoElement.nativeElement.currentTime = seconds;
    this.videoElement.nativeElement.play();
  }
}

// 3. Tự động cuộn thanh scroll xuống dòng đang đọc
// 2. Viết lại hàm cuộn (FIX LỖI CUỘN CẢ MÀN HÌNH)
scrollToActiveLine(index: number) {
  // Nếu hộp transcript chưa mở hoặc không tồn tại thì bỏ qua
  if (!this.transcriptContainer || !this.isTranscriptOpen) return;

  const container = this.transcriptContainer.nativeElement;
  const activeLine = document.getElementById('line-' + index);

  if (activeLine) {
    // Tính toán vị trí của dòng active so với đỉnh của container
    const lineTop = activeLine.offsetTop;
    const lineHeight = activeLine.clientHeight;
    const containerHeight = container.clientHeight;

    // Công thức để đưa dòng active vào GIỮA hộp container
    // Vị trí scroll = (Vị trí dòng) - (Một nửa chiều cao hộp) + (Một nửa chiều cao dòng)
    const scrollPosition = lineTop - (containerHeight / 2) + (lineHeight / 2);

    // Chỉ cuộn thằng container thôi, màn hình chính đứng im
    container.scrollTo({
      top: scrollPosition,
      behavior: 'smooth'
    });
  }
}

// --- INTERACTION LOGIC ---

toggleTranscript() {
  this.isTranscriptOpen = !this.isTranscriptOpen;
}

checkQuiz() {
  if (!this.selectedQuizOption) {
    this.quizFeedback = { msg: 'Vui lòng chọn đáp án!', type: 'error' };
    return;
  }
  if (this.selectedQuizOption === this.quiz.correctValue) {
    this.quizFeedback = { msg: 'Chính xác! Xuất sắc.', type: 'success' };
  } else {
    this.quizFeedback = { msg: 'Sai rồi, thử lại nhé!', type: 'error' };
  }
}

checkGapFill() {
  const answer = this.gapInput.trim().toLowerCase();
  if (!answer) return;

  if (answer === 'long-term') {
    this.gapFeedback = { msg: 'Chính xác! (long-term perspective)', type: 'success' };
  } else if (answer.startsWith('long')) {
    this.gapFeedback = { msg: "Gợi ý: Từ ghép bắt đầu bằng 'long-...'", type: 'hint' };
  } else {
    this.gapFeedback = { msg: 'Chưa đúng, hãy nghe kỹ lại đoạn cuối.', type: 'error' };
  }
}

}
