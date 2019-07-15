<template>
  <div class="app-container">
    <el-button type="primary" @click="handleAddUser">
      {{ $t('permission.addUser') }}
    </el-button>

    <el-table :data="userList" style="width: 100%;margin-top:30px;" border>
      <el-table-column align="center" label="ID" width="220">
        <template slot-scope="scope">
          {{ scope.row.key }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="用户名称" width="220">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column align="header-center" label="描述">
        <template slot-scope="scope">
          {{ scope.row.introduction }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope)">
            {{ $t('permission.editUser') }}
          </el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope)">
            {{ $t('permission.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'编辑权限':'添加角色'">
      <el-form :model="user" label-width="80px" label-position="left">
        <el-form-item label="用户名称">
          <el-input v-model="user.name" :disabled="dialogType === 'edit'" placeholder="请输入用户名称" />
        </el-form-item>
        <el-form-item label="用户密码">
          <el-input v-model="user.password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="用户描述">
          <el-input
            v-model="user.introduction"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="用户描述"
          />
        </el-form-item>
        <el-form-item label="角色">
          <el-radio-group ref="radio" v-model="role">
            <el-radio v-for="item in rolesList" :key="item.key" :label="item.name">{{ item.description }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">
          {{ $t('permission.cancel') }}
        </el-button>
        <el-button type="primary" @click="confirmRole">
          {{ $t('permission.confirm') }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { deepClone } from '@/utils'
import { getRoles } from '@/api/role'
import { getUser, addUser, updateUser, deleteUser } from '@/api/user'

const defaultUser = {
  key: '',
  name: '',
  password: '',
  description: '',
  role: ''
}

export default {
  data() {
    return {
      user: Object.assign({}, defaultUser),
      role: '1',
      routes: [],
      rolesList: [],
      userList: [],
      dialogVisible: false,
      dialogType: 'new',
      checkStrictly: false
    }
  },
  computed: {
    rolesData() {
      return this.rolesList
    }
  },
  created() {
    // Mock: get all routes and roles list from server
    this.getUsers()
    this.getRoles()
  },
  methods: {
    async getUsers() {
      const res = await getUser()
      this.userList = res.data
    },
    async getRoles() {
      const res = await getRoles()
      this.rolesList = res.data
    },
    handleAddUser() {
      this.user = Object.assign({}, defaultUser)
      this.role = ''
      this.dialogType = 'new'
      this.dialogVisible = true
    },
    handleEdit(scope) {
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.checkStrictly = true
      this.user = deepClone(scope.row)
      this.role = this.user.roleList[0].name
      this.$nextTick(() => {
        // const routes = this.generateRoutes(this.role.routes)
        // this.$refs.tree.setCheckedNodes(this.generateArr(routes))
        // set checked state of a node not affects its father and child nodes
        this.checkStrictly = false
      })
    },
    handleDelete({ $index, row }) {
      this.$confirm('确认删除用户?', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          await deleteUser(row.key)
          this.userList.splice($index, 1)
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        })
        .catch(err => {
          console.error(err)
        })
    },
    async confirmRole() {
      debugger
      const isEdit = this.dialogType === 'edit'

      this.user.roles = [this.role]

      if (this.user.name.length < 3) {
        this.$message.error('用户名最少 3 个字符')
        return
      }
      if (this.user.roles.length < 1) {
        this.$message.error('请选择角色')
        return
      }
      if (isEdit) {
        await updateUser(this.user.key, this.user)
        for (let index = 0; index < this.userList.length; index++) {
          if (this.userList[index].key === this.user.key) {
            this.userList.splice(index, 1, Object.assign({}, this.user))
            break
          }
        }
      } else {
        if (this.user.password.length < 3) {
          this.$message.error('密码最少 3 个字符')
          return
        }
        const { data } = await addUser(this.user)
        this.user.key = data.key
        this.userList.push(this.user)
      }

      const { introduction, key, name } = this.user
      this.dialogVisible = false
      this.$notify({
        title: 'Success',
        dangerouslyUseHTMLString: true,
        message: `
            <div>ID: ${key}</div>
            <div>用户名称: ${name}</div>
            <div>描述: ${introduction}</div>
          `,
        type: 'success'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .app-container {
    .roles-table {
      margin-top: 30px;
    }

    .permission-tree {
      margin-bottom: 30px;
    }
  }
</style>
