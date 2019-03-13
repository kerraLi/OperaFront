/** When your routing table is too long, you can split it into small modules**/

import Layout from '@/views/layout/Layout'
// import { fetchCateList } from '@/api/resource'

let tmpTree = [];
// tmpTree.push({
//   path: 'hardware/list',
//   component: () => import('@/views/resource/hardware'),
//   name: 'Hardware',
//   meta: {
//     title: 'Hardware',
//   }
// });

tmpTree.push({
  path: 'cate',
  component: () => import('@/views/resource/category'),
  name: 'ResourceCate',
  meta: {
    title: 'ResourceCate',
  }
});

tmpTree.push({
  path: 'upload',
  component: () => import('@/views/resource/upload'),
  name: 'ResourceUpload',
  meta: {
    title: 'ResourceUpload',
  }
});

const componentsRouter = {
  path: '/resource',
  component: Layout,
  redirect: '/resource/index',
  name: 'Resource',
  meta: {
    title: 'Resource',
    icon: 'resource',
  },
  children: tmpTree
};

export default componentsRouter
