import { ChangeDetectorRef, Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ApiService } from "@app/core/services/api.service";
import { Subject, takeUntil } from "rxjs";

@Component({
  selector: "app-lesson-detail",
  templateUrl: "./lesson-detail.component.html",
  styleUrls: ["./lesson-detail.component.scss"],
})
export class LessonDetailComponent {
  readonly S3_BASE_URL =
    "https://luyen-giao-tiep-audio.s3.us-east-1.amazonaws.com/";

  lesson: any;
  isLoading = true;
  isScriptVisible = false; // Trạng thái ẩn/hiện script
  currentTab: any = "en"; // Tab ngôn ngữ đang chọn
  optionStates: any = {};
  currentSpeed = 1;
  currentQuizIndex: number = 0;

  // listerning
  currentListenIdx = 0; // Quản lý bài nghe hiện tại (0, 1, 2)

  // shadowing Thêm các biến vào class LessonDetailComponent
  isRecording = false;
  currentRecordingId: number | null = null;
  mediaRecorder: any;
  audioChunks: any[] = [];
  userAudioUrls: { [key: number]: string } = {}; // Lưu trữ link blob tạm thời
  isAudioPlaying = false; // Biến khóa toàn cục cho phần nghe
  currentAudio: HTMLAudioElement | null = null;
  playingId: number | null = null; // Để biết câu nào đang phát
  currentPageShadow = 0;
  hiddenTextStates: { [key: number]: boolean } = {};

  // translaction
  currentWritingPageIdx: number = 0;
  userAnswers: { [key: number]: string } = {};
  showWritingKey: { [key: number]: boolean } = {}; // Lưu trạng thái hiện đáp án riêng cho từng câu

  // gramar
  // Chỉ số trang hiện tại
  currentGrammarPageIdx: number = 0;

  // Lưu từ đã chọn theo ID của từng câu
  userSelectedWords: { [key: number]: string[] } = {};
  showGrammarKey: { [key: number]: boolean } = {};

  // Sử dụng Subject để quản lý việc hủy tất cả Subscription cùng lúc
  private destroy$ = new Subject<void>();

  // --- Biến quản lý ---
  speakingNotes: string = "";
  recordingTime: number = 0;
  timerInterval: any;
  showAnalysis: boolean = false;

  // Giả lập kết quả AI
  studioRecorder = {
    recorder: null as MediaRecorder | null,
    chunks: [] as Blob[],
    url: null as string | null,
    isRecording: false,
    seconds: 0,
    timer: null as any
  };
  aiResult = { score: 0, fluency: "", comment: "" };
  

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private cdr: ChangeDetectorRef,
  ) {}

  /**
   * ngOnInit
   */
  ngOnInit(): void {
    // Lấy 'code' từ URL: /danh-muc/danh-sach-bai-hoc/thi-hien-tai-don
    const code = this.route.snapshot.paramMap.get("code");

    if (code) {
      this.loadLessonDetail(code);
    }
  }

  /**
   * Load lesson detail
   * @param code
   */
  loadLessonDetail(code: string): void {
    this.api
      .get<any>(`/api/v1/lessons/${code}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.lesson = res;
 
        },
        error: (err) => console.error("Lỗi gọi API:", err),
      });
  }

  /**
   * Speak text
   * @param path
   * @returns
   */
  speakText(path: string) {
    if (!path || this.isAudioPlaying) return; // Nếu đang phát thì bấm nữa cũng vô hiệu

    this.isAudioPlaying = true; // Khóa lại ngay lập tức

    const fullUrl = `${this.S3_BASE_URL}${path}`;
    const audio = new Audio(fullUrl);

    audio.onended = () => {
      this.isAudioPlaying = false; // Khi nghe xong thì mở khóa
    };

    audio.onerror = () => {
      this.isAudioPlaying = false; // Nếu lỗi cũng phải mở khóa để họ bấm lại được
    };

    audio.play().catch((err) => {
      console.error("Lỗi S3:", err);
      this.isAudioPlaying = false;
    });
  }

  /**
   * changeSpeed
   * @param audioElement
   * @param event
   */
  changeSpeed(audioElement: HTMLAudioElement, event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const speed = parseFloat(selectElement.value);
    audioElement.playbackRate = speed;
  }

  /**
   * toggleScript
   */
  toggleScript(): void {
    this.isScriptVisible = !this.isScriptVisible;
  }

  /**
   * switchTab
   * @param lang
   */
  switchTab(lang: "en" | "vi"): void {
    this.currentTab = lang;
  }

  /**
   * handle Answer
   * @param qIdx
   * @param oIdx
   */
  handleAnswer(qIdx: number, oIdx: number) {
    // Nếu nhấn lại chính ô đang chọn -> Xoá chọn (Toggle)
    // Key tạo ra sẽ có dạng: listen_0_1 (bài nghe 0, câu hỏi 1)
    const stateKey = `listen_${this.currentListenIdx}_${qIdx}`;
    this.optionStates[stateKey] = oIdx;
  }

  /**
   * nextListen
   */
  nextListen() {
    if (this.currentListenIdx < this.lesson.content.listening.length - 1) {
      this.currentListenIdx++;
      this.isScriptVisible = false;
    }
  }

  /**
   * prevListen
   */
  prevListen() {
    if (this.currentListenIdx > 0) {
      this.currentListenIdx--;
      this.isScriptVisible = false;
    }
  }

  // shadowing
  speakTextShadowing(path: string, id: number) {
    if (!path) return;

    // Nếu đang phát chính câu này -> Bấm lại thì Pause
    if (this.playingId === id && this.currentAudio) {
      this.currentAudio.pause();
      this.resetAudioState();
      return;
    }

    // Nếu đang phát câu khác mà học viên bấm câu mới -> Dừng câu cũ, phát câu mới
    if (this.currentAudio) {
      this.currentAudio.pause();
    }

    const fullUrl = `${this.S3_BASE_URL}${path}`;
    this.currentAudio = new Audio(fullUrl);
    this.playingId = id;

    this.currentAudio.onended = () => {
      this.resetAudioState();
    };

    this.currentAudio.onerror = () => {
      this.resetAudioState();
    };

    this.currentAudio.play().catch((err) => {
      console.error("Lỗi phát audio:", err);
      this.resetAudioState();
    });
  }

  // Hàm bổ trợ để reset trạng thái
  private resetAudioState() {
    this.currentAudio = null;
    this.playingId = null;
  }
  // 1. Hàm bắt đầu ghi âm
  // 1. Hàm bắt đầu ghi âm
  async startRecording(id: number) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event: any) => {
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: "audio/wav" });
        const audioUrl = URL.createObjectURL(audioBlob);

        // Lưu vào object để quản lý theo ID câu
        this.userAudioUrls[id] = audioUrl;

        // TẮT MICRO sau khi dừng để giải phóng thiết bị
        stream.getTracks().forEach((track) => track.stop());

        this.cdr.detectChanges();
      };

      this.mediaRecorder.start();
      this.isRecording = true;
      this.currentRecordingId = id;
      this.cdr.detectChanges();
    } catch (err) {
      console.error("Lỗi Micro:", err);
      alert("Vui lòng cho phép quyền truy cập Micro để ghi âm!");
    }
  }

  playRecordedAudio(id: number) {
    const url = this.userAudioUrls[id];
    if (url) {
      const audio = new Audio(url);
      audio.play();
    }
  }

  // 2. Hàm dừng ghi âm
  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      this.currentRecordingId = null;
      this.cdr.detectChanges(); // Cập nhật để hiện lại nút "Ghi âm"
    }
  }

  // 3. Hàm xử lý nút bấm Ghi âm (Toggle)
  handleShadow(id: number) {
    if (this.isRecording && this.currentRecordingId === id) {
      this.stopRecording();
    } else {
      this.startRecording(id);
    }
  }

  /**
   * nextShadowPage
   */
  nextShadowPage() {
    if (this.currentPageShadow < this.lesson.content.shadowing.length - 1) {
      this.currentPageShadow++;
    }
  }

  /**
   * prevShadowPage
   */
  prevShadowPage() {
    if (this.currentPageShadow > 0) {
      this.currentPageShadow--;
    }
  }

  /**
   * toggleTextVisibility
   * @param itemId
   */
  toggleTextVisibility(itemId: number) {
    // Đảo ngược trạng thái: nếu đang hiện thì ẩn, đang ẩn thì hiện
    this.hiddenTextStates[itemId] = !this.hiddenTextStates[itemId];
  }

  // 2. Điều hướng Mũi tên
  nextWritingPage() {
    if (
      this.lesson?.content?.writingChallenges &&
      this.currentWritingPageIdx <
        this.lesson.content.writingChallenges.length - 1
    ) {
      this.currentWritingPageIdx++;
      this.cdr.detectChanges();
    }
  }

  prevWritingPage() {
    if (this.currentWritingPageIdx > 0) {
      this.currentWritingPageIdx--;
      this.cdr.detectChanges();
    }
  }

  // 3. Tiện ích khi bấm vào Tag gợi ý
  addWordToWriting(word: string, itemId: number) {
    const currentText = this.userAnswers[itemId] || "";
    this.userAnswers[itemId] = (currentText + " " + word).trim();
  }

  // 4. Tính % thanh tiến độ
  // Hàm toggle chuẩn chỉnh
  toggleKey(id: number) {
    // Nếu chưa có id này trong object, ta gán là true, ngược lại thì đảo ngược giá trị
    if (this.showWritingKey[id] === undefined) {
      this.showWritingKey[id] = true;
    } else {
      this.showWritingKey[id] = !this.showWritingKey[id];
    }
    
    // Quan trọng: Ép Angular nhận diện sự thay đổi trong Object
    this.cdr.detectChanges(); 
  }

  // Điều hướng theo Page (Object lớn)
nextGrammarPage() {
  if (this.currentGrammarPageIdx < this.lesson.content.grammarChallenges.length - 1) {
    this.currentGrammarPageIdx++;
  }
}

prevGrammarPage() {
  if (this.currentGrammarPageIdx > 0) {
    this.currentGrammarPageIdx--;
  }
}

// Logic chọn từ
pickWord(word: string, itemId: number) {
  if (!this.userSelectedWords[itemId]) this.userSelectedWords[itemId] = [];
  this.userSelectedWords[itemId].push(word);
}

// Hoàn tác từ
removeWord(idx: number, itemId: number) {
  this.userSelectedWords[itemId].splice(idx, 1);
}

// Xoá sạch các từ đã chọn để làm lại
clearGrammar(itemId: number) {
  // Reset mảng từ đã chọn của câu này về rỗng
  this.userSelectedWords[itemId] = [];
  
  // Ẩn luôn đáp án nếu họ đang mở (để làm lại từ đầu cho khách quan)
  this.showGrammarKey[itemId] = false;
  
  this.cdr.detectChanges();
}

// AI speaking
// --- Logic ---
async toggleStudioRecord() {
  const sr = this.studioRecorder; // Viết tắt cho gọn

  if (!sr.isRecording) {
    // --- BẮT ĐẦU THU ---
    sr.chunks = [];
    sr.url = null;
    this.showAnalysis = false;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      sr.recorder = new MediaRecorder(stream);
      
      sr.recorder.ondataavailable = (e) => sr.chunks.push(e.data);
      
      sr.recorder.onstop = () => {
        const blob = new Blob(sr.chunks, { type: 'audio/wav' });
        sr.url = URL.createObjectURL(blob);
        this.cdr.detectChanges();
      };

      sr.recorder.start();
      sr.isRecording = true;
      this.startStudioTimer();
    } catch (err) {
      alert("Không thể truy cập Micro. CEO kiểm tra lại quyền trình duyệt nhé!");
    }
  } else {
    // --- DỪNG THU ---
    if (sr.recorder) sr.recorder.stop();
    sr.isRecording = false;
    this.stopStudioTimer();
    this.runAIAnalysis();
  }
}

startStudioTimer() {
  this.studioRecorder.seconds = 0;
  this.studioRecorder.timer = setInterval(() => {
    this.studioRecorder.seconds++;
  }, 1000);
}

stopStudioTimer() {
  if (this.studioRecorder.timer) clearInterval(this.studioRecorder.timer);
}

// Format 00:00 cho riêng Studio
get studioTimeDisplay(): string {
  const s = this.studioRecorder.seconds;
  return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
}

runAIAnalysis() {
  this.showAnalysis = true;
  this.aiResult.comment = "AI is evaluating your speech...";
  setTimeout(() => {
    this.aiResult = {
      score: 8.5,
      fluency: "Good",
      comment: "Great job! Your intonation is natural. Try to emphasize key nouns more."
    };
    this.cdr.detectChanges();
  }, 2000);
}

}
