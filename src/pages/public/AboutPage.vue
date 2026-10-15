<template>
  <div>
    <section class="border-b border-black/10 bg-[#f4f4f1]">
      <div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <BreadcrumbNav :items="[{ label: 'About Us' }]" />
        <p class="mt-10 text-xs font-black tracking-[0.2em] uppercase md:text-sm">
          About The Pocket Shoes
        </p>
        <h1
          class="mt-5 max-w-4xl text-4xl leading-[0.96] font-black tracking-tight sm:text-5xl lg:text-7xl"
        >
          Shoes you didn't know you need.
        </h1>
        <p
          class="mt-6 max-w-2xl text-base leading-7 font-medium text-black/70 md:text-lg md:leading-8"
        >
          The Pocket Shoes là cửa hàng giày trực tuyến tuyển chọn sneaker và giày thời trang cho nam
          và nữ. Chúng tôi không bán thật nhiều mẫu, chúng tôi chọn những đôi đáng để bạn mang mỗi
          ngày.
        </p>
        <div class="mt-8 flex flex-wrap gap-3">
          <RouterLink
            to="/products"
            class="inline-flex bg-black px-6 py-3.5 text-xs font-black tracking-wide text-white uppercase no-underline transition hover:bg-black/80"
          >
            Khám phá sản phẩm
          </RouterLink>
          <a
            href="#ai"
            class="inline-flex border border-black px-6 py-3.5 text-xs font-black tracking-wide text-black uppercase no-underline transition hover:bg-black hover:text-white"
          >
            Pocket AI Stylist
          </a>
        </div>
      </div>
    </section>

    <section
      class="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1fr_2fr] md:py-20 lg:px-8"
    >
      <h2 class="text-2xl font-black tracking-tight md:text-3xl">Câu chuyện của chúng tôi</h2>
      <div class="space-y-5 text-base leading-7 text-black/75">
        <p>
          Chọn được một đôi giày ưng ý thường khó hơn ta nghĩ: quá nhiều mẫu, quá nhiều thông số, và
          rất khó hình dung đôi giày sẽ hợp với mình đến đâu khi chỉ nhìn qua màn hình.
        </p>
        <p>
          The Pocket Shoes ra đời để rút ngắn quãng đường đó. Mỗi sản phẩm trên cửa hàng được tuyển
          chọn theo kiểu dáng, chất liệu và khả năng phối đồ, sắp xếp theo thương hiệu và bộ sưu tập
          để bạn tìm nhanh hơn, kèm bài viết trên blog để bạn hiểu rõ hơn về thứ mình mang.
        </p>
        <p>
          Bước tiếp theo của chúng tôi là đưa trí tuệ nhân tạo vào trải nghiệm mua sắm, để việc tìm
          giày trở nên cá nhân như khi có một người bạn sành giày đứng cạnh.
        </p>
      </div>
    </section>

    <section class="border-y border-black/10 bg-black text-white">
      <div class="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 md:py-20 lg:px-8">
        <div>
          <p class="text-xs font-black tracking-[0.2em] text-white/50 uppercase">Sứ mệnh</p>
          <p class="mt-4 text-2xl leading-snug font-black md:text-3xl">
            Giúp mỗi người tìm được đôi giày hợp với dáng chân, phong cách và nhịp sống của mình.
          </p>
        </div>
        <div>
          <p class="text-xs font-black tracking-[0.2em] text-white/50 uppercase">Tầm nhìn</p>
          <p class="mt-4 text-2xl leading-snug font-black md:text-3xl">
            Trở thành cửa hàng giày cá nhân hoá bằng AI, nơi bạn nói phong cách của mình và nhận về
            đúng đôi giày dành cho bạn.
          </p>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
      <h2 class="text-2xl font-black tracking-tight md:text-3xl">Điều chúng tôi theo đuổi</h2>
      <div
        class="mt-10 grid gap-px overflow-hidden border border-black/10 bg-black/10 sm:grid-cols-2 lg:grid-cols-4"
      >
        <article v-for="(value, index) in values" :key="value.title" class="bg-white p-6">
          <p class="text-xs font-black text-black/40">{{ String(index + 1).padStart(2, '0') }}</p>
          <h3 class="mt-4 text-lg font-black">{{ value.title }}</h3>
          <p class="mt-3 text-sm leading-6 text-black/65">{{ value.description }}</p>
        </article>
      </div>
    </section>

    <section id="ai" class="scroll-mt-24 border-t border-black/10 bg-[#f4f4f1]">
      <div class="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
        <div class="max-w-3xl">
          <p class="text-xs font-black tracking-[0.2em] uppercase">Đang phát triển</p>
          <h2 class="mt-4 text-3xl leading-tight font-black tracking-tight md:text-5xl">
            Pocket AI Stylist
          </h2>
          <p class="mt-5 text-base leading-7 text-black/70">
            Trợ lý AI giúp bạn tìm giày theo cách tự nhiên nhất: cho xem một tấm ảnh, kể về bản
            thân, hoặc hỏi như đang hỏi một người bạn. Chúng tôi dự định xây dựng trợ lý trên các mô
            hình Claude của Anthropic, kết hợp với dữ liệu sản phẩm, size và tồn kho thực tế của cửa
            hàng.
          </p>
        </div>

        <div class="mt-12 grid gap-6 lg:grid-cols-3">
          <article
            v-for="feature in aiFeatures"
            :key="feature.title"
            class="flex flex-col border border-black/10 bg-white p-6"
          >
            <div class="flex items-center justify-between gap-3">
              <p class="text-xs font-black text-black/40">{{ feature.phase }}</p>
              <span
                class="border border-black/15 px-2 py-1 text-[11px] font-black tracking-wide uppercase"
              >
                {{ feature.status }}
              </span>
            </div>
            <h3 class="mt-5 text-xl font-black">{{ feature.title }}</h3>
            <p class="mt-3 text-sm leading-6 text-black/65">{{ feature.description }}</p>
            <ol
              class="mt-5 space-y-2 border-t border-black/10 pt-5 text-sm leading-6 text-black/75"
            >
              <li v-for="(step, index) in feature.steps" :key="step" class="flex gap-3">
                <span class="font-black text-black/40">{{ index + 1 }}.</span>
                <span>{{ step }}</span>
              </li>
            </ol>
          </article>
        </div>

        <div class="mt-12 grid gap-8 border-t border-black/10 pt-10 md:grid-cols-[1fr_2fr]">
          <h3 class="text-xl font-black">Nguyên tắc khi dùng AI</h3>
          <ul class="grid gap-4 sm:grid-cols-2">
            <li v-for="principle in aiPrinciples" :key="principle.title">
              <p class="font-black">{{ principle.title }}</p>
              <p class="mt-1 text-sm leading-6 text-black/65">{{ principle.description }}</p>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <section v-if="team.length" class="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
      <h2 class="text-2xl font-black tracking-tight md:text-3xl">Đội ngũ</h2>
      <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <article v-for="member in team" :key="member.name" class="border border-black/10 p-6">
          <h3 class="text-lg font-black">{{ member.name }}</h3>
          <p class="mt-1 text-xs font-black tracking-wide text-black/50 uppercase">
            {{ member.role }}
          </p>
          <p v-if="member.bio" class="mt-4 text-sm leading-6 text-black/65">{{ member.bio }}</p>
        </article>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
      <div
        class="flex flex-col items-start justify-between gap-6 bg-black px-6 py-10 text-white md:flex-row md:items-center md:px-10"
      >
        <div>
          <h2 class="text-2xl font-black tracking-tight md:text-3xl">
            Tìm đôi giày tiếp theo của bạn
          </h2>
          <p class="mt-2 text-sm text-white/70">
            Trong lúc Pocket AI Stylist đang được hoàn thiện, hãy bắt đầu từ những bộ sưu tập của
            chúng tôi.
          </p>
        </div>
        <div class="flex flex-wrap gap-3">
          <RouterLink
            to="/collections"
            class="inline-flex bg-white px-6 py-3.5 text-xs font-black tracking-wide text-black uppercase no-underline transition hover:bg-white/80"
          >
            Bộ sưu tập
          </RouterLink>
          <RouterLink
            to="/blogs"
            class="inline-flex border border-white px-6 py-3.5 text-xs font-black tracking-wide text-white uppercase no-underline transition hover:bg-white hover:text-black"
          >
            Đọc blog
          </RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import BreadcrumbNav from '@/components/common/BreadcrumbNav.vue'

type TeamMember = { name: string; role: string; bio?: string }

const values = [
  {
    title: 'Tuyển chọn kỹ',
    description:
      'Ít mẫu hơn nhưng đáng mua hơn. Mỗi đôi giày được chọn vì kiểu dáng, chất liệu và khả năng phối đồ.',
  },
  {
    title: 'Đúng size, đúng dáng',
    description:
      'Thông tin size theo từng biến thể và bảng size của thương hiệu giúp bạn chọn chính xác ngay lần đầu.',
  },
  {
    title: 'Minh bạch',
    description: 'Giá và tồn kho từng size được cập nhật trực tiếp trên trang sản phẩm.',
  },
  {
    title: 'Mua nhanh, gọn',
    description: 'Đặt hàng trong vài bước, không bắt buộc tạo tài khoản.',
  },
]

const aiFeatures = [
  {
    phase: 'Giai đoạn 1',
    status: 'Đang phát triển',
    title: 'Tìm giày từ ảnh',
    description:
      'Tải lên ảnh một đôi giày bạn thích hoặc một bộ trang phục, AI nhận diện phong cách và gợi ý những đôi tương tự hoặc hợp để phối.',
    steps: [
      'Bạn tải ảnh giày hoặc outfit lên.',
      'AI mô tả kiểu dáng, màu sắc, chất liệu và phong cách trong ảnh.',
      'Hệ thống đối chiếu với sản phẩm còn hàng và gợi ý những đôi phù hợp nhất.',
    ],
  },
  {
    phase: 'Giai đoạn 2',
    status: 'Kế hoạch',
    title: 'Gợi ý theo tính cách',
    description:
      'Một bộ câu hỏi ngắn về lối sống, phong cách và thói quen di chuyển để tìm ra kiểu giày hợp với bạn.',
    steps: [
      'Trả lời vài câu hỏi: bạn đi đâu, mặc gì, thích nổi bật hay tối giản.',
      'AI phân tích và xác định “hồ sơ phong cách” của bạn.',
      'Nhận danh sách giày gợi ý kèm giải thích vì sao chúng hợp với bạn.',
    ],
  },
  {
    phase: 'Giai đoạn 3',
    status: 'Kế hoạch',
    title: 'Trợ lý tư vấn và chọn size',
    description:
      'Trò chuyện để hỏi về chất liệu, cách phối đồ, so sánh hai mẫu giày và được gợi ý size theo từng thương hiệu.',
    steps: [
      'Hỏi bằng tiếng Việt như khi nhắn tin với người bán.',
      'Trợ lý trả lời dựa trên thông tin sản phẩm và bảng size thực tế.',
      'Thêm đôi giày đã chọn vào giỏ hàng ngay trong cuộc trò chuyện.',
    ],
  },
]

const aiPrinciples = [
  {
    title: 'Gợi ý dựa trên hàng thật',
    description:
      'AI chỉ gợi ý sản phẩm đang bán và còn size, không đưa ra mẫu không có trong cửa hàng.',
  },
  {
    title: 'Tôn trọng ảnh của bạn',
    description:
      'Ảnh tải lên chỉ dùng để phân tích phong cách cho lượt tìm kiếm đó, không dùng cho mục đích khác.',
  },
  {
    title: 'Giải thích được',
    description: 'Mỗi gợi ý đi kèm lý do, để bạn hiểu vì sao đôi giày đó hợp với mình.',
  },
  {
    title: 'Con người vẫn ở đó',
    description: 'Bạn luôn có thể tự duyệt sản phẩm như bình thường, AI chỉ là một lối tắt.',
  },
]

// Điền thông tin thật của founder/đội ngũ; mục "Đội ngũ" chỉ hiển thị khi danh sách không rỗng.
const team: TeamMember[] = []
</script>
