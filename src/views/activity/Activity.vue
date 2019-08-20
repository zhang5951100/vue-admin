<template>
  <div class="activity">
    <el-tabs v-model="activeName">
      <el-tab-pane name="1" label="发起流程">
        <el-form ref="leave" :model="leave" :rules="rules" label-width="100px" class="demo-ruleForm">
          <el-form-item label="开始时间" required>
            <el-col :span="5">
              <el-form-item prop="startDate">
                <el-date-picker
                  v-model="leave.startDate"
                  type="datetime"
                  placeholder="选择日期时间"
                  default-time="08:00:00"
                />
              </el-form-item>
            </el-col>
          </el-form-item>
          <el-form-item label="结束时间" required>
            <el-col :span="5">
              <el-form-item prop="endDate">
                <el-date-picker
                  v-model="leave.endDate"
                  type="datetime"
                  placeholder="选择日期时间"
                  default-time="17:00:00"
                />
              </el-form-item>
            </el-col>
          </el-form-item>
          <el-form-item label="请假类型" prop="type">
            <el-select v-model="leave.type" placeholder="请选择请假类型">
              <el-option label="事假" value="shanghai" />
              <el-option label="带薪假" value="beijing" />
            </el-select>
          </el-form-item>
          <el-form-item label="请假说明" prop="desc">
            <el-col :span="5">
              <el-input v-model="leave.desc" type="textarea" placeholder="请填写请假说明" />
            </el-col>
          </el-form-item>
          <el-form-item hidden prop="submit">
            <el-switch v-model="leave.submit" />
          </el-form-item>
          <el-form-item hidden prop="operator">
            <el-input v-model="leave.operator" />
          </el-form-item>
          <el-form-item hidden prop="operatorId">
            <el-input v-model="leave.operatorId" />
          </el-form-item>
          <el-form-item hidden prop="processName">
            <el-input v-model="leave.processName" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitForm('leave')">立即申请</el-button>
            <el-button @click="resetForm('leave')">重置</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane name="2" label="待办流程">
        <el-table :data="todoLeaves" style="width: 100%;margin-top:30px;" border :default-sort="{prop: 'createTime', order: 'descending'}">
          <el-table-column align="center" label="任务 ID">
            <template slot-scope="scope">
              {{ scope.row.taskId }}
            </template>
          </el-table-column>
          <el-table-column align="center" label="申请说明">
            <template slot-scope="scope">
              {{ scope.row.desc }}
            </template>
          </el-table-column>
          <el-table-column align="center" label="流程节点">
            <template slot-scope="scope">
              {{ scope.row.taskName }}
            </template>
          </el-table-column>
          <el-table-column align="header-center" label="实例 ID">
            <template slot-scope="scope">
              {{ scope.row.instanceId }}
            </template>
          </el-table-column>
          <el-table-column align="header-center" label="审批人">
            <template slot-scope="scope">
              {{ scope.row.assignee }}
            </template>
          </el-table-column>
          <el-table-column prop="createTime" align="header-center" :formatter="dateFormat" label="创建时间" />
          <el-table-column align="center" label="审批">
            <template slot-scope="scope">
              <el-button type="primary" size="small" @click="approve(scope)">
                审批
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane name="3" label="我的流程">
        <el-table :data="myLeaves" style="width: 100%;margin-top:30px;" border :default-sort="{prop: 'createTime', order: 'descending'}">
          <el-table-column align="center" label="任务 ID">
            <template slot-scope="scope">
              {{ scope.row.taskId }}
            </template>
          </el-table-column>
          <el-table-column align="center" label="流程节点">
            <template slot-scope="scope">
              {{ scope.row.taskName }}
            </template>
          </el-table-column>
          <el-table-column align="header-center" label="实例 ID">
            <template slot-scope="scope">
              {{ scope.row.instanceId }}
            </template>
          </el-table-column>
          <el-table-column align="header-center" label="申请人">
            <template slot-scope="scope">
              {{ scope.row.assignee }}
            </template>
          </el-table-column>
          <el-table-column prop="createTime" align="header-center" :formatter="dateFormat" label="创建时间" />
          <el-table-column align="header-center" label="状态">
            <template slot-scope="scope">
              <el-tag v-if="scope.row.status==='进行中'" type="success">{{ scope.row.status }}</el-tag>
              <el-tag v-else type="info">{{ scope.row.status }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane name="4" label="历史记录">历史记录</el-tab-pane>
    </el-tabs>

    <!--弹出层-->
    <el-dialog
      title="审批"
      :visible.sync="centerDialogVisible"
      width="30%"
      center
    >
      <span slot="footer">
        <el-button type="warning" @click="approveSubmit">拒 绝</el-button>
        <el-button type="primary" @click="approveSubmit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { parseTime } from '@/utils'

export default {
  name: 'Activity',
  data() {
    return {
      centerDialogVisible: false,
      activeName: '1',
      leave: {
        type: '',
        startDate: '',
        endDate: '',
        date2: '',
        desc: '',
        operator: '',
        operatorId: '',
        processName: 'leave',
        taskId: ''
      },
      rules: {
        type: [
          { required: true, message: '请选择请假类型', trigger: 'change' }
        ],
        startDate: [
          { type: 'date', required: true, message: '请选择日期', trigger: 'change' }
        ],
        endDate: [
          { type: 'date', required: true, message: '请选择日期', trigger: 'change' }
        ],
        date2: [
          { type: 'date', required: true, message: '请选择时间', trigger: 'change' }
        ],
        desc: [
          { required: true, message: '请选择请假说明', trigger: 'blur' }
        ]
      },
      myLeaves: [],
      todoLeaves: [],
      approveLeave: {}
    }
  },
  computed: {
    ...mapGetters([
      'name',
      'id'
    ])
  },
  created() {
    this.getUser()
    this.getMyLeaves()
    this.getTodoLeaves()
  },
  methods: {
    // 格式化时间
    dateFormat(row, column) {
      const date = row[column.property]
      if (date === undefined) {
        return ''
      }
      return parseTime(date)
    },
    submitForm(formName) {
      this.$refs[formName].validate(async(valid) => {
        if (valid) {
          const url = '/api/workflow/applies'
          this.$axiox.post(url, this.leave).then(res => {
            console.log(res.data)
            this.activeName = '3'
            // 清空表单
            this.resetForm(formName)
            // 重新拉取数据
            this.getMyLeaves()
            this.getTodoLeaves()
          }).catch(res => {
            console.log(res)
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
    },
    getUser() {
      this.leave.operator = this.name
      this.leave.operatorId = this.id
    },
    getMyLeaves() {
      const url = `/api/workflow/leaves/${this.leave.operator}`
      this.$axiox.get(url).then(res => {
        this.myLeaves = res.data
        console.log('我的流程' + this.myLeaves)
      }).catch(res => {
        console.log(res)
      })
    },
    getTodoLeaves() {
      const url = `/api/workflow/processes/${this.leave.operator}`
      this.$axiox.get(url).then(res => {
        console.log(res.data)
        this.todoLeaves = res.data
        console.log('待办流程' + this.todoLeaves)
      }).catch(res => {
        console.log(res)
      })
    },
    approve({ row }) {
      this.centerDialogVisible = true
      this.approveLeave = row
    },
    approveSubmit() {
      switch (this.approveLeave.taskName) {
        case '一级审批':
          this.approveLeave.firstAgree = true
          break
        case '二级审批':
          this.approveLeave.secondAgree = true
          break
        default:
          break
      }
      const url = '/api/workflow/approvals'
      this.$axiox.post(url, this.approveLeave).then(res => {
        this.centerDialogVisible = false
        console.log(res.data)
        // 重新拉取数据
        this.getMyLeaves()
        this.getTodoLeaves()
      }).catch(res => {
        console.log(res)
      })
    }
  }
}
</script>

<style scoped>
  .activity {
    margin-left: 10px;
  }
</style>
