// ����pinia��defineStore����
import { defineStore } from 'pinia'
// ����sleep����
import { sleep } from '../services/utils'
// ����BillingAddress����
import { BillingAddress } from '../pages/payments/types'

// �����ȡ�˵���ַ���첽����
const fetchBillingAddresses = async () => {
  // ģ���첽�������ȴ�1��
  await sleep(1000)
  // �����˵���ַ����
  return [
    {
      id: '1',
      name: 'Home address',
      isPrimary: true,
      street: 'Ap #285-7193 Ullamcorper Avenue',
      city: 'Amesbury',
      state: 'HI',
      postalCode: '93373',
      country: 'US',
    },
    {
      id: '2',
      name: 'Office address',
      isPrimary: false,
      street: 'P.O. Box 847, 8011 Nisl St.',
      city: 'Morgantown',
      state: 'IN',
      postalCode: '46160',
      country: 'US',
    },
    {
      id: '3',
      name: 'Vacation home',
      isPrimary: false,
      street: '883-2699 Egestas Rd.',
      city: 'Frederick',
      state: 'NE',
      postalCode: '20620',
      country: 'US',
    },
  ] as BillingAddress[]
}

// �����˵���ַ��store
export const useBillingAddressesStore = defineStore({
  // ����store��id
  id: 'billingAddresses',
  // ����state
  state: () => ({
    // �˵���ַ����
    billingAddresses: [] as BillingAddress[],
    // ����״̬
    loading: false,
  }),
  // ����getters
  getters: {
    // ��ȡ�����˵���ַ
    allBillingAddresses: (state) => state.billingAddresses,
  },
  // ����actions
  actions: {
    // �����˵���ַ
    async load() {
      // ���ü���״̬Ϊtrue
      this.loading = true
      // ����fetchBillingAddresses������ȡ�˵���ַ
      this.billingAddresses = await fetchBillingAddresses()
      // ���ü���״̬Ϊfalse
      this.loading = false
    },
    // �����˵���ַ
    create(address: BillingAddress) {
      // ���µ�ַ���ӵ��˵���ַ�������ǰ��
      this.billingAddresses.unshift(address)
    },
    // �����˵���ַ
    update(address: BillingAddress) {
      // ����id�ҵ�Ҫ���µĵ�ַ
      const index = this.billingAddresses.findIndex((existingCard) => existingCard.id === address.id)
      // ����ҵ��ˣ����滻
      if (index !== -1) {
        this.billingAddresses.splice(index, 1, address)
      }
    },
    // ɾ���˵���ַ
    remove(addressId: string) {
      // ����id���˵�Ҫɾ���ĵ�ַ
      this.billingAddresses = this.billingAddresses.filter((address) => address.id !== addressId)
    },
  },
})
