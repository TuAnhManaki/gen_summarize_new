import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '@app/core/services/api.service';
import { WordPair } from '@app/core/models/word-pair.model';
import { Title } from '@angular/platform-browser';
import { ToastService } from '@app/core/toast/service/toast.service';
import { AudioService } from '@app/core/services/audio.service';

@Component({
  selector: 'app-adjective-adverb-detail',
  templateUrl: './adjective-adverb-detail.component.html',
  styleUrls: ['./adjective-adverb-detail.component.scss']
})
export class AdjectiveAdverbDetailComponent {

  wordData: WordPair | null = null;
  isLoading = true;

  constructor(
      private toast: ToastService,
    private route: ActivatedRoute,
    private api: ApiService,
    private titleService: Title,
          private audioService: AudioService
    
    
  ) {}

  ngOnInit(): void {
    const verb = this.route.snapshot.paramMap.get('verb');

    if (verb) {
      this.getVerbDetail(verb);
    }
  }

  getVerbDetail(word: string) {
      this.isLoading = true;
  
      this.api.get<WordPair>('/api/v1/adjective-adverbs/:word', { word: word })
        .subscribe({
          next: (res) => {
            this.wordData = res;
            this.isLoading = false;
            this.titleService.setTitle('Tính từ & Trạng từ: ');

          },
          error: (err) => {
            const msg = err.error?.message || err.message || "Lỗi không xác định";
            this.toast.showError(`Lỗi tải bài học: ${msg}`);
            this.isLoading = false;
          }
        });
    }

    playAudio(text: string) {
      this.audioService.speak(text);
    }

}
