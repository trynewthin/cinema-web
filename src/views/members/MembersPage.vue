<script setup lang="ts">
import { ref } from 'vue'
import MembersTable from './widgets/MembersTable.vue'
import EditMemberForm from './widgets/EditMemberForm.vue'
import { Member } from './types'
import { useMembers } from './composables/useMembers'
import { useModal, useToast } from 'vuestic-ui'

const doShowEditMemberModal = ref(false)
const memberToEdit = ref<Member | null>(null)

const { members, isLoading, filters, pagination, ...membersApi } = useMembers()

const showEditMemberModal = (member: Member) => {
  memberToEdit.value = member
  doShowEditMemberModal.value = true
}

const showAddMemberModal = () => {
  memberToEdit.value = null
  doShowEditMemberModal.value = true
}

const { init: notify } = useToast()

const onMemberSaved = async (member: Member) => {
  if (memberToEdit.value) {
    await membersApi.update(member)
    notify({
      message: `会员 ${member.name} 已更新`,
      color: 'success',
    })
  } else {
    await membersApi.add(member)
    notify({
      message: `会员 ${member.name} 已创建`,
      color: 'success',
    })
  }
}

const onMemberDelete = async (member: Member) => {
  await membersApi.remove(member)
  notify({
    message: `会员 ${member.name} 已删除`,
    color: 'success',
  })
}

const editFormRef = ref()

const { confirm } = useModal()

const beforeEditFormModalClose = async (hide: () => unknown) => {
  if (editFormRef.value.isFormHasUnsavedChanges) {
    const agreed = await confirm({
      maxWidth: '380px',
      message: '表单有未保存的更改，确定要关闭吗？',
      size: 'small',
    })
    if (agreed) {
      hide()
    }
  } else {
    hide()
  }
}

const onPageChange = (page: number) => {
  pagination.value.page = page
}

const onPerPageChange = (perPage: number) => {
  pagination.value.perPage = perPage
  pagination.value.page = 1
}

const handlePaginationUpdate = (newPagination: { page: number; perPage: number; total: number }) => {
  // 更新分页状态
  pagination.value.page = newPagination.page
  pagination.value.perPage = newPagination.perPage
  pagination.value.total = newPagination.total
}
</script>

<template>
  <h1 class="page-title text-2xl font-bold mb-6">会员管理</h1>

  <VaCard>
    <VaCardContent>
      <div class="flex flex-col md:flex-row gap-2 mb-2 justify-between">
        <div class="flex flex-col md:flex-row gap-2 justify-start">
          <VaInput v-model="filters.name" placeholder="搜索会员">
            <template #prependInner>
              <VaIcon name="search" color="secondary" size="small" />
            </template>
          </VaInput>
        </div>
        <VaButton @click="showAddMemberModal">添加会员</VaButton>
      </div>

      <MembersTable
        :members="members"
        :loading="isLoading"
        :pagination="pagination"
        @editMember="showEditMemberModal"
        @deleteMember="onMemberDelete"
        @update:page="onPageChange"
        @update:perPage="onPerPageChange"
        @updatePagination="handlePaginationUpdate"
      />
    </VaCardContent>
  </VaCard>

  <VaModal
    v-slot="{ cancel, ok }"
    v-model="doShowEditMemberModal"
    size="small"
    mobile-fullscreen
    close-button
    hide-default-actions
    :before-cancel="beforeEditFormModalClose"
  >
    <h1 class="va-h5">{{ memberToEdit ? '编辑会员' : '添加会员' }}</h1>
    <EditMemberForm
      ref="editFormRef"
      :member="memberToEdit"
      :save-button-label="memberToEdit ? '保存' : '添加'"
      @close="cancel"
      @save="
        (member) => {
          onMemberSaved(member)
          ok()
        }
      "
    />
  </VaModal>
</template>
