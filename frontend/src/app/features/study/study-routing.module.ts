import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LessonListComponent } from './pages/lesson-list/lesson-list.component';
import { ProgressComponent } from './pages/progress/progress.component';
import { TenseDetailComponent } from './pages/tense-detail/tense-detail.component';
import { TensesComponent } from './pages/tenses/tenses.component';
import { StructuresComponent } from './pages/structures/structures.component';
import { StructuresDetailComponent } from './pages/structures-detail/structures-detail.component';
import { IrregularVerbsComponent } from './pages/irregular-verbs/irregular-verbs.component';
import { IrregularVerbDetailComponent } from './pages/irregular-verb-detail/irregular-verb-detail.component';
import { ListeningComponent } from './pages/listening/listening.component';
import { ListeningListComponent } from './pages/listening-list/listening-list.component';
import { ListeningDetailComponent } from './pages/listening-detail/listening-detail.component';
import { SpeakingComponent } from './pages/speaking/speaking.component';
import { SpeakingListComponent } from './pages/speaking-list/speaking-list.component';
import { SpeakingPracticeComponent } from './pages/speaking-practice/speaking-practice.component';
import { AdjectiveAdverbComponent } from './pages/adjective-adverb/adjective-adverb.component';
import { AdjectiveAdverbDetailComponent } from './pages/adjective-adverb-detail/adjective-adverb-detail.component';
import { LessonDetailComponent } from './pages/lesson-detail/lesson-detail.component';
import { VideoListeningComponent } from './pages/video-listening/video-listening.component';

const routes: Routes = [
  { path: 'progress', component: ProgressComponent },
  { path: 'danh-sach-bai-hoc', component: LessonListComponent },
  { path: 'danh-sach-bai-hoc/:code', component: LessonDetailComponent },
  { path: 'cac_thi_co_ban', component: TensesComponent },
  { path: 'cac_thi_co_ban/:slug', component: TenseDetailComponent },
  { path: 'ngu_phap', component: StructuresComponent },
  { path: 'ngu_phap/:slug', component: StructuresDetailComponent },
  { path: 'bat_dong_tu', component: IrregularVerbsComponent },
  { path: 'bat_dong_tu/:verb', component: IrregularVerbDetailComponent },
  { path: 'trang_tu_tinh_tu', component:  AdjectiveAdverbComponent},
  { path: 'trang_tu_tinh_tu/:verb', component: AdjectiveAdverbDetailComponent },
  { path: 'listening', component: ListeningComponent },
  { path: 'listening/:categoryId', component: ListeningListComponent },
  { path: 'listening/:categoryId/:lessonId', component: ListeningDetailComponent },
  { path: 'speaking', component:  SpeakingComponent},
  { path: 'speaking/:categoryId', component: SpeakingListComponent },
  { path: 'speaking/:categoryId/:lessonId', component: SpeakingPracticeComponent },
  { path: 'video-listening', component: VideoListeningComponent },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StudyRoutingModule {}
