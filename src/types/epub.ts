export interface EPUBChapter {
  id: string;
  title: string;
  href: string;
  content: string;
  mediaOverlay?: string;
}

export interface SMILFragment {
  id: string;
  textSrc: string;
  audioSrc: string;
  clipBegin: number;
  clipEnd: number;
  text: string;
  order: number;
}

export interface AudioFile {
  src: string;
  blob: Blob;
  duration: number;
}

export interface EPUBData {
  title: string;
  chapters: EPUBChapter[];
  smilFiles: Map<string, SMILFragment[]>;
  audioFiles: Map<string, AudioFile>;
  manifest: any;
}