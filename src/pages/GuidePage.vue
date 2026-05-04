<template>
  <section
    class="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-7xl flex-col gap-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8"
  >
    <div class="space-y-3">
      <div class="flex flex-wrap items-center gap-2">
        <UiBadge
          variant="primary"
          label="/guide"
        />
        <UiBadge
          variant="success"
          label="Reusable patterns"
        />
      </div>
      <div>
        <h1
          class="text-2xl font-bold tracking-tight text-[var(--ui-text)] sm:text-3xl"
        >
          Guide & pattern library
        </h1>
        <p
          class="mt-2 max-w-3xl text-sm leading-6 text-[var(--ui-text-muted)] sm:text-base"
        >
          Toàn bộ phần hướng dẫn, demo component và pattern tích hợp Axios +
          Pinia được gom về đây để màn
          <code>/fds</code> tập trung cho flow chính.
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
      <UiCard
        title="Route map"
        description="Sơ đồ route hiện tại để bạn mở rộng sau này."
      >
        <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
          <UiCard
            bordered
            :shadow="false"
            padding="sm"
            class="border-dashed"
          >
            <div class="space-y-2">
              <UiBadge
                variant="primary"
                label="/fds"
              />
              <p class="text-sm text-[var(--ui-text-muted)]">
                Flow chính để upload ảnh, chỉnh text/icon và export mockup.
              </p>
            </div>
          </UiCard>
          <UiCard
            bordered
            :shadow="false"
            padding="sm"
            class="border-dashed"
          >
            <div class="space-y-2">
              <UiBadge
                variant="success"
                label="/guide"
              />
              <p class="text-sm text-[var(--ui-text-muted)]">
                Giữ hướng dẫn, examples, pattern UI để dễ tra cứu và copy lại.
              </p>
            </div>
          </UiCard>
          <UiCard
            bordered
            :shadow="false"
            padding="sm"
            class="border-dashed"
          >
            <div class="space-y-2">
              <UiBadge
                variant="warning"
                label="/admin"
              />
              <p class="text-sm text-[var(--ui-text-muted)]">
                Khu admin tách layout riêng, phù hợp CRUD, template manager, asset
                manager.
              </p>
            </div>
          </UiCard>
        </div>
      </UiCard>

      <UiCard
        title="Quick links"
        padding="md"
      >
        <div class="space-y-3">
          <RouterLink
            v-for="item in links"
            :key="item.to"
            :to="item.to"
            class="block no-underline"
          >
            <div
              class="rounded-[var(--ui-radius-md)] border border-[var(--ui-border)] px-4 py-3 transition hover:bg-[var(--ui-surface-soft)]"
            >
              <div class="font-semibold text-[var(--ui-text)]">
                {{ item.label }}
              </div>
              <div class="text-sm text-[var(--ui-text-soft)]">
                {{ item.desc }}
              </div>
            </div>
          </RouterLink>
        </div>
      </UiCard>
    </div>

    <div class="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
      <UiCard
        title="Mini design system"
        padding="md"
      >
        <div class="space-y-4">
          <UiForm>
            <UiFormItem
              label="Trạng thái thêu"
              hint="Các component này dùng lại trực tiếp cho form setting sau này."
            >
              <UiRadio
                v-model="sampleTemplate"
                :options="TEMPLATE_OPTIONS"
                stacked
              />
            </UiFormItem>

            <UiFormItem label="Tùy chọn nhanh">
              <div class="space-y-3">
                <UiCheckbox
                  v-model="sampleFlags.metallic"
                  label="Metallic thread"
                  description="Thêm hiệu ứng chỉ ánh kim cho template hiển thị."
                />
                <UiCheckbox
                  v-model="sampleFlags.outline"
                  label="Outline"
                  description="Tạo viền đậm quanh nội dung thêu."
                />
                <UiSwitch
                  v-model="sampleFlags.autoCenter"
                  label="Auto center"
                  description="Tự căn giữa object khi thêm mới trên canvas."
                />
              </div>
            </UiFormItem>
          </UiForm>

          <div class="flex flex-wrap gap-2">
            <UiTag label="Embroidery" />
            <UiTag
              label="Template active"
              variant="primary"
            />
            <UiTag
              label="Closable tag"
              closable
              @close="onTagClose"
            />
          </div>

          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <UiDropdown
              :items="MENU_ITEMS"
              trigger-text="Menu hành động"
              @select="onMenuSelect"
            />
            <UiPopover
              title="Mẹo mobile"
              content="Ưu tiên tabs, drawer và bottom sheet cho thao tác một tay trên điện thoại."
              trigger-text="Popover hướng dẫn"
              placement="right"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <UiButton
              block
              variant="secondary"
              @click="openDrawer = true"
            >
              Mở drawer demo
            </UiButton>
            <UiButton
              block
              variant="outline"
              @click="
                pushToast(
                  'Đây là toast mẫu để bạn gắn vào action thành công.',
                  'success',
                  'Saved',
                )
              "
            >
              Bắn toast
            </UiButton>
          </div>
        </div>
      </UiCard>

      <UiCard
        title="API / global store"
        description="Pattern chuẩn: components gọi store, store gọi service, service dùng axios httpClient."
        padding="md"
      >
        <UiForm class="space-y-4">
          <UiFormItem
            label="Access token"
            hint="Token sẽ tự được gắn vào header Authorization qua interceptor."
          >
            <UiInput
              v-model="accessTokenModel"
              placeholder="Bearer token hoặc JWT"
             label="Bearer token hoặc JWT"/>
          </UiFormItem>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <UiButton
              :loading="apiLoading"
              block
              @click="fetchTemplateList"
            >
              Gọi GET /templates
            </UiButton>
            <UiButton
              block
              variant="outline"
              @click="
                pushToast(
                  'Store hiện quản lý theme, access token và request loading toàn cục.',
                  'info',
                  'Pinia',
                )
              "
            >
              Xem pattern store
            </UiButton>
          </div>
        </UiForm>
      </UiCard>
    </div>

    <div
      class="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]"
    >
      <UiCard
        title="Admin/data base"
        description="Dùng cho template list, asset manager hoặc dashboard đơn giản."
      >
        <UiTable
          :columns="TABLE_COLUMNS"
          :rows="pagedTemplates"
          row-key="id"
          aria-label="Template demo table"
          caption="Danh sách template demo"
          density="sm"
          sticky-header
          striped
        >
          <template #cell-name="{ row }">
            <div class="flex min-w-[180px] items-center gap-3">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-[var(--ui-radius-sm)] bg-[var(--ui-primary-soft)] font-semibold text-[var(--ui-primary)]"
              >
                {{ row.name.slice(0, 1) }}
              </div>
              <div class="min-w-0">
                <div class="font-semibold text-[var(--ui-text)]">
                  {{ row.name }}
                </div>
                <div class="truncate text-xs text-[var(--ui-text-soft)]">
                  {{ row.note }}
                </div>
              </div>
            </div>
          </template>
          <template #cell-status="{ value }">
            <UiBadge
              :label="(value as any)"
              :variant="badgeVariant(value as any)"
            />
          </template>
          <template #cell-tags="{ value }">
            <div class="flex min-w-[160px] flex-wrap gap-2">
              <UiTag
                v-for="tag in value"
                :key="tag"
                :label="(tag as any)"
                variant="outline"
              />
            </div>
          </template>
          <template #cell-actions="{ row }">
            <div class="flex min-w-[160px] gap-2">
              <UiButton
                size="sm"
                variant="ghost"
                @click="previewTemplate(row)"
              >
                Preview
              </UiButton>
              <UiButton
                size="sm"
                variant="outline"
                @click="duplicateTemplate(row)"
              >
                Clone
              </UiButton>
            </div>
          </template>
          <template #footer>
            <UiPagination
              v-model:page="currentPage"
              :page-size="PAGE_SIZE"
              :total="templateRows.length"
            />
          </template>
        </UiTable>
      </UiCard>

      <div class="space-y-4">
        <UiCard
          title="Empty state + loading"
          padding="md"
        >
          <div class="space-y-4">
            <UiEmpty
              title="Chưa có template team"
              description="Khi chưa có dữ liệu, dùng empty state để tránh cảm giác trống và thêm CTA rõ ràng."
            >
              <template #action>
                <UiButton
                  size="sm"
                  @click="
                    pushToast(
                      'Tạo template mới từ empty state.',
                      'info',
                      'Create',
                    )
                  "
                >
                  Tạo template mới
                </UiButton>
              </template>
            </UiEmpty>
            <UiCard
              bordered
              :shadow="false"
              padding="sm"
              class="border-dashed"
            >
              <div class="space-y-3">
                <UiSkeleton
                  avatar
                  :rows="3"
                />
                <UiSkeleton
                  :rows="2"
                  compact
                />
              </div>
            </UiCard>
          </div>
        </UiCard>

        <UiCard
          title="Badge trạng thái"
          padding="md"
        >
          <div class="flex flex-wrap gap-2">
            <UiBadge
              label="active"
              variant="success"
            />
            <UiBadge
              label="draft"
              variant="warning"
            />
            <UiBadge
              label="archived"
              variant="neutral"
            />
            <UiBadge
              label="error"
              variant="danger"
            />
          </div>
        </UiCard>
      </div>
    </div>

    <UiDrawer
      :open="openDrawer"
      title="Drawer mobile-first"
      description="Phù hợp cho settings nâng cao hoặc bộ template dài trên mobile."
      @close="openDrawer = false"
    >
      <UiForm class="space-y-4">
        <UiFormItem label="Tên template">
          <UiInput
            v-model="drawerTemplateName"
            placeholder="Ví dụ: Street embroidery"
           label="Ví dụ: Street embroidery"/>
        </UiFormItem>
        <UiFormItem label="Ghi chú">
          <UiTextarea
            v-model="drawerNote"
            placeholder="Mô tả template, font, màu, độ dày chỉ..."
            rows="5"
           label="Mô tả template, font, màu, độ dày chỉ..."/>
        </UiFormItem>
        <UiButton
          block
          @click="saveDrawerTemplate"
        >
          Lưu template demo
        </UiButton>
      </UiForm>
    </UiDrawer>

    <UiToast
      :items="toasts"
      @remove="removeToast"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { RouterLink } from "vue-router";
import { useToast, type ToastVariant } from "@/composables/useToast";
import { useAppStore } from "@/stores/app";
import {
  UiBadge,
  UiButton,
  UiCard,
  UiCheckbox,
  UiDrawer,
  UiDropdown,
  UiEmpty,
  UiForm,
  UiFormItem,
  UiInput,
  UiPagination,
  UiPopover,
  UiRadio,
  UiSkeleton,
  UiSwitch,
  UiTable,
  UiTag,
  UiTextarea,
  UiToast,
} from "@/components/ui";

type BadgeVariant = "primary" | "success" | "warning" | "danger" | "neutral";

interface TemplateRow extends Record<string, unknown> {
  id: string;
  name: string;
  note: string;
  status: "active" | "draft" | "archived";
  tags: string[];
}

type TableColumn<Row extends Record<string, unknown>> = {
  key: keyof Row & string | string;
  label: string;
  align?: "left" | "center" | "right";
  widthClass?: string;
};

const links = [
  {
    label: "Mở flow thiết kế",
    to: "/fds",
    desc: "Đi tới màn chính để upload và export mockup.",
  },
  {
    label: "Mở admin base",
    to: "/admin",
    desc: "Đi tới layout admin để phát triển dashboard.",
  },
];

const demoRows: TemplateRow[] = [
  {
    id: "tpl-01",
    name: "Runner hero",
    note: "Hero banner cho storefront giay chay.",
    status: "active",
    tags: ["storefront", "hero"],
  },
  {
    id: "tpl-02",
    name: "Product grid",
    note: "Card san pham, gia sale va badge stock.",
    status: "active",
    tags: ["catalog", "card"],
  },
  {
    id: "tpl-03",
    name: "Admin table",
    note: "Bang CRUD dense cho admin.",
    status: "draft",
    tags: ["admin", "table"],
  },
  {
    id: "tpl-04",
    name: "Checkout form",
    note: "Form dat hang nhanh tren PDP.",
    status: "archived",
    tags: ["sales", "form"],
  },
];

const appStore = useAppStore();
const { toasts, push, remove: removeToast } = useToast();
const apiLoading = ref(false);
const currentPage = ref(1);
const openDrawer = ref(false);
const drawerTemplateName = ref("");
const drawerNote = ref("");
const sampleTemplate = ref("active");
const sampleFlags = reactive({
  metallic: false,
  outline: true,
  autoCenter: true,
});
const templateRows = ref<TemplateRow[]>(demoRows);

const PAGE_SIZE = 3;
const TABLE_COLUMNS: TableColumn<TemplateRow>[] = [
  { key: "name", label: "Template", widthClass: "min-w-[240px]" },
  { key: "status", label: "Status" },
  { key: "tags", label: "Tags", widthClass: "min-w-[180px]" },
  { key: "actions", label: "", align: "right", widthClass: "w-40" },
];
const TEMPLATE_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Draft", value: "draft" },
  { label: "Archived", value: "archived" },
];
const MENU_ITEMS = [
  { key: "refresh", label: "Refresh", meta: "GET" },
  { key: "toast", label: "Toast", meta: "UI" },
  { key: "drawer", label: "Drawer", meta: "Mobile" },
];

const accessTokenModel = computed({
  get: () => appStore.accessToken,
  set: (value: string) => appStore.setAccessToken(value),
});

const pagedTemplates = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE;
  return templateRows.value.slice(start, start + PAGE_SIZE);
});

function pushToast(message: string, variant: ToastVariant = "info", title = "") {
  push(message, variant, title);
}

function badgeVariant(value: unknown): BadgeVariant {
  if (value === "active") return "success";
  if (value === "draft") return "warning";
  if (value === "archived") return "neutral";
  return "primary";
}

async function fetchTemplateList() {
  apiLoading.value = true;
  await new Promise((resolve) => window.setTimeout(resolve, 250));
  apiLoading.value = false;
  pushToast("Da nap danh sach template demo.", "success", "Loaded");
}

function onMenuSelect(key: string) {
  if (key === "refresh") void fetchTemplateList();
  else if (key === "drawer") openDrawer.value = true;
  else pushToast(`Da chon ${key}.`, "info", "Menu");
}

function onTagClose() {
  pushToast("Tag da duoc dong.", "info");
}

function previewTemplate(row: TemplateRow) {
  pushToast(row.note, "info", row.name);
}

function duplicateTemplate(row: TemplateRow) {
  templateRows.value = [
    {
      ...row,
      id: `${row.id}-copy-${Date.now()}`,
      name: `${row.name} copy`,
      status: "draft",
    },
    ...templateRows.value,
  ];
  currentPage.value = 1;
  pushToast("Da clone template demo.", "success");
}

function saveDrawerTemplate() {
  if (!drawerTemplateName.value.trim()) {
    pushToast("Nhap ten template truoc khi luu.", "warning");
    return;
  }

  templateRows.value = [
    {
      id: `tpl-${Date.now()}`,
      name: drawerTemplateName.value.trim(),
      note: drawerNote.value.trim() || "Template moi tu drawer.",
      status: "draft",
      tags: ["drawer"],
    },
    ...templateRows.value,
  ];
  drawerTemplateName.value = "";
  drawerNote.value = "";
  openDrawer.value = false;
  currentPage.value = 1;
  pushToast("Da luu template demo.", "success", "Saved");
}
</script>
