// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

// 환경 변수 타입 정의
declare namespace App {
	namespace Env {
		// PUBLIC 접두사가 붙은 변수는 클라이언트 사이드에서 접근 가능
		interface Public {
			PUBLIC_API_BASE_URL: string;
		}
		// 접두사가 없는 변수는 서버 사이드에서만 접근 가능
		interface Private {
			// 필요시 서버 전용 환경 변수 추가
		}
	}
}

export {};
