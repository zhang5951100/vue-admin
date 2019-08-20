<template>
  <div class="app-container">
    <el-button type="primary" @click="addResource">
      {{ $t('permission.addMenu') }}
    </el-button>
    <div class="tree">
      <el-table
        :data="routes"
        style="width: 100%"
      >
        <el-table-column type="expand">
          <template scope="scope">
            <el-table
              border
              :data="scope.row.son"
              style="width: 100%"
            >
              <el-table-column
                align="center"
                label="path"
                prop="path"
              />
              <el-table-column
                align="center"
                label="component"
                prop="component"
              />
              <el-table-column
                align="center"
                label="name"
                prop="name"
              />
              <el-table-column
                align="center"
                label="title"
                prop="meta.title"
              />
            </el-table>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          label="菜单名称"
          prop="meta.title"
        />
        <el-table-column
          align="center"
          label="图标"
          prop="meta.icon"
        />
        <el-table-column
          align="center"
          label="创建时间"
          prop="creatTime"
        />
        <el-table-column
          align="center"
          label="更新时间"
          prop="updateTime"
        />
        <el-table-column align="center" label="操作" width="150">
          <template scope="scope">
            <el-button size="small" type="primary" @click="handleEdit(scope)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleEdit">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'编辑菜单':'添加菜单'">
      <el-form :model="data" label-width="80px" label-position="left">
        <el-form-item label="菜单名称">
          <el-input v-model="data.name" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item label="菜单描述">
          <el-input
            v-model="data.address"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="角色描述"
          />
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
import { deepClone, parseTime } from '@/utils'

const defaultData = {
  date: '',
  name: '',
  address: '',
  son: []
}

export default {
  name: 'Menu',
  data() {
    return {
      data: Object.assign({}, defaultData),
      dialogVisible: false,
      dialogType: 'new',
      routes: []
    }
  },
  mounted() {
    this.getRoutes()
  },
  methods: {
    async getRoutes() {
      const url = '/api/routes'
      this.$axiox.get(url).then(res => {
        this.routes = res.data.map(item => {
          return {
            meta: item.meta,
            creatTime: parseTime(item.creatTime),
            updateTime: parseTime(item.updateTime),
            son: item.children
          }
        })
      }).catch(res => {
        console.log(res)
      })
      console.log(this.routes)
    },
    addResource() {
      console.log('addResource')
    },
    handleEdit(scope) {
      debugger
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.data = deepClone(scope.row)
    },
    async confirmRole() {
      const isEdit = this.dialogType === 'edit'
      if (isEdit) {
        debugger
        this.routes = this.dataProcessing(this.routes)
      } else {
        // const { data } = await addRole(this.role)
        // this.role.key = data.key
        // this.rolesList.push(this.role)
      }

      this.dialogVisible = false
    },
    dataProcessing(data) {
      for (let i = 0; i < data.length; i++) {
        if (data[i].id === this.data.id) {
          data.splice(i, 1, Object.assign({}, this.data))
          break
        } else if (data[i].son) {
          this.dataProcessing(data[i].son)
        }
      }
      return data
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
<style scoped>
  .tree {
    margin-top: 20px;
  }
</style>
