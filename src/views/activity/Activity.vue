<template>
  <div class="activity">
    <el-tabs v-model="activeName">
      <el-tab-pane name="1" label="发起流程">
        <el-form ref="vacation" :model="vacation" :rules="rules" label-width="100px" class="demo-ruleForm">
          <el-form-item label="开始时间" required>
            <el-col :span="5">
              <el-form-item prop="startDate">
                <el-date-picker
                  v-model="vacation.startDate"
                  prefix-icon="el-icon-date"
                  type="datetime"
                  placeholder="选择日期时间"
                  default-time="08:00:00"
                  @change="onChange"
                />
              </el-form-item>
            </el-col>
          </el-form-item>
          <el-form-item label="结束时间" required>
            <el-col :span="5">
              <el-form-item prop="endDate">
                <el-date-picker
                  v-model="vacation.endDate"
                  prefix-icon="el-icon-date"
                  type="datetime"
                  placeholder="选择日期时间"
                  default-time="17:00:00"
                  @change="onChange"
                />
              </el-form-item>
            </el-col>
          </el-form-item>
          <el-form-item label="请假时长" prop="type">
            <span>{{ vacation.totalHour | numFilter }} 时</span>
          </el-form-item>
          <el-form-item label="请假类型" prop="type">
            <el-select v-model="vacation.type" placeholder="请选择请假类型">
              <el-option label="事假" value="事假" />
              <el-option label="带薪假" value="带薪假" />
            </el-select>
          </el-form-item>
          <el-form-item label="请假说明" prop="explanation">
            <el-col :span="5">
              <el-input v-model="vacation.explanation" type="textarea" placeholder="请填写请假说明" />
            </el-col>
          </el-form-item>
          <el-form-item hidden prop="submit">
            <el-switch v-model="vacation.submit" />
          </el-form-item>
          <el-form-item hidden prop="operator">
            <el-input v-model="vacation.operator" />
          </el-form-item>
          <el-form-item hidden prop="operatorId">
            <el-input v-model="vacation.operatorId" />
          </el-form-item>
          <el-form-item hidden prop="processName">
            <el-input v-model="vacation.processName" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitForm('vacation')">立即申请</el-button>
            <el-button @click="resetForm('vacation')">重置</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane name="2" label="待办流程">
        <el-table
          ref="todoVacations"
          :data="todoVacations"
          style="width: 100%;margin-top:30px;"
          border
          size="mini"
          highlight-current-row
          :default-sort="{prop: 'createTime', order: 'descending'}"
        >
          <el-table-column
            align="center"
            type="index"
            width="50"
          />
          <el-table-column align="center" label="流程名称">
            <template slot-scope="scope">
              {{ scope.row.processName }}
            </template>
          </el-table-column>
          <el-table-column align="center" label="实例 ID">
            <template slot-scope="scope">
              {{ scope.row.instanceId }}
            </template>
          </el-table-column>
          <el-table-column align="center" label="申请说明">
            <template slot-scope="scope">
              <el-button type="text" size="small" @click="handleClick(scope.row)">{{ scope.row.explanation }}
              </el-button>
            </template>
          </el-table-column>
          <el-table-column align="center" label="请假时长">
            <template slot-scope="scope">
              {{ scope.row.totalHour | numFilter }} 时
            </template>
          </el-table-column>
          <el-table-column align="center" label="请假类型">
            <template slot-scope="scope">
              {{ scope.row.type }}
            </template>
          </el-table-column>
          <el-table-column align="center" label="流程节点">
            <template slot-scope="scope">
              {{ scope.row.taskName }}
            </template>
          </el-table-column>
          <el-table-column prop="createTime" align="center" :formatter="dateFormat" label="创建时间" />
          <el-table-column fixed="right" align="center" label="审批">
            <template slot-scope="scope">
              <el-button type="primary" size="small" @click="approve(scope)">
                审批
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane name="3" label="我的流程">
        <el-table
          :data="myVacations"
          highlight-current-row
          border
          size="mini"
          style="width: 100%;margin-top:30px;"
          :default-sort="{prop: 'createTime', order: 'descending'}"
        >
          <el-table-column
            align="center"
            type="index"
            width="50"
          />
          <el-table-column align="center" label="实例 ID">
            <template slot-scope="scope">
              {{ scope.row.instanceId }}
            </template>
          </el-table-column>
          <el-table-column align="center" label="流程名称">
            <template slot-scope="scope">
              {{ scope.row.processName }}
            </template>
          </el-table-column>
          <el-table-column align="center" label="申请人">
            <template slot-scope="scope">
              {{ scope.row.applicant }}
            </template>
          </el-table-column>
          <el-table-column prop="createTime" align="center" :formatter="dateFormat" label="创建时间" />
          <el-table-column align="center" label="状态">
            <template slot-scope="scope">
              <el-tag v-if="scope.row.status==='审批中'" type="success">{{ scope.row.status }}</el-tag>
              <el-tag v-else type="info">{{ scope.row.status }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
        <pagination
          v-show="total>0"
          :total="total"
          :page.sync="listQuery.page"
          :limit.sync="listQuery.limit"
          @pagination="getMyVacations"
        />
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
      <el-input v-model="opinion" :autosize="{ minRows: 8}" type="textarea" placeholder="请填写审批意见" />
      <span slot="footer">
        <el-button type="warning" @click="approveSubmit(false)">拒 绝</el-button>
        <el-button type="primary" @click="approveSubmit(true)">确 定</el-button>
      </span>
    </el-dialog>

    <!--弹出层-->
    <el-dialog
      title="审批流程"
      :visible.sync="showStepBar"
      width="50%"
      height="50px"
      center
    >
      <div class="stepBar">
        <el-steps :active="stepBar.active" align-center finish-status="success" :process-status="stepBar.status">
          <el-step title="提交申请" />
          <el-step title="一级审批" :description="stepBar.opinion1" />
          <el-step title="二级审批" :description="stepBar.opinion2" />
          <el-step title="审批完成" />
        </el-steps>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'Activity',
  components: { Pagination },
  filters: {
    numFilter(value) {
      // 截取当前数据到小数点后1位
      return parseFloat(value).toFixed(1)
    }
  },
  data() {
    return {
      listQuery: {
        page: 1,
        limit: 10,
        importance: undefined,
        title: undefined,
        type: undefined,
        sort: '+id'
      },
      total: 0,
      centerDialogVisible: false,
      showStepBar: false,
      activeName: '1',
      vacation: {
        id: '',
        type: '',
        startDate: '',
        endDate: '',
        totalHour: 0.00,
        explanation: '',
        applicant: '',
        applicantId: '',
        processName: '',
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
        explanation: [
          { required: true, message: '请选择请假说明', trigger: 'blur' }
        ]
      },
      myVacations: [],
      todoVacations: [],
      approveVacation: {},
      opinion: '',
      stepBar: {
        active: 0,
        status: 'process',
        opinion1: '',
        opinion2: ''
      }
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
    this.getMyVacations()
    this.getTodoVacations()
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
    onChange() {
      if (this.vacation.startDate && this.vacation.endDate) {
        const startDate = Date.parse(this.vacation.startDate)
        const endDate = Date.parse(this.vacation.endDate)
        if (startDate > endDate) {
          this.$message.error('请注意时间顺序')
          this.vacation.startDate = ''
        } else {
          const date = endDate - startDate
          this.vacation.totalHour = date / 1000 / 60 / 60 - 1
        }
      }
    },
    submitForm(formName) {
      this.$refs[formName].validate(async(valid) => {
        if (valid) {
          const url = '/api/vacations/applies'
          this.$axiox.post(url, this.vacation).then(res => {
            console.log(res.data)
            this.activeName = '3'
            // 清空表单
            this.resetForm(formName)
            // 重新拉取数据
            this.getMyVacations()
            this.getTodoVacations()
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
      this.vacation.applicant = this.name
      this.vacation.applicantId = this.id
    },
    getMyVacations() {
      const url = `/api/vacations/vacations/${this.vacation.applicantId}
      /${this.listQuery.page}/${this.listQuery.limit}`

      this.$axiox.get(url).then(res => {
        console.log('我的流程:' + JSON.stringify(res.data))
        this.myVacations = res.data.list
        this.total = res.data.total
        console.log('我的流程' + this.myVacations)
      }).catch(res => {
        console.log(res)
      })
    },
    getTodoVacations() {
      const url = `/api/vacations/processes/${this.vacation.applicantId}`
      this.$axiox.get(url).then(res => {
        console.log(res.data)
        this.todoVacations = res.data
        console.log('待办流程' + this.todoVacations)
      }).catch(res => {
        console.log(res)
      })
    },
    approve({ row }) {
      this.centerDialogVisible = true
      this.approveVacation = row
    },
    approveSubmit(isAgree) {
      switch (this.approveVacation.taskName) {
        case '一级审批':
          this.approveVacation.firstAgree = isAgree
          this.approveVacation.firstApproveDesc = this.opinion
          break
        case '二级审批':
          this.approveVacation.secondAgree = isAgree
          this.approveVacation.secondApproveDesc = this.opinion
          break
        default:
          break
      }
      // 清空
      this.opinion = ''
      const url = '/api/vacations/approvals'
      this.$axiox.post(url, this.approveVacation).then(res => {
        this.centerDialogVisible = false
        console.log(res.data)
        // 重新拉取数据
        this.getMyVacations()
        this.getTodoVacations()
      }).catch(res => {
        console.log(res)
      })
    },
    handleClick(row) {
      debugger
      switch (row.taskName) {
        case '一级审批':
          this.stepBar.active = 1
          break
        case '二级审批':
          this.stepBar.active = 2
          break
        default:
          break
      }
      this.stepBar.opinion1 = row.firstApproveDesc
      this.stepBar.opinion2 = row.secondApproveDesc
      this.showStepBar = true
    }
  }
}
</script>

<style scoped>
  .activity {
    margin: 0 10px;
  }

  .stepBar {
    height: 100px;
  }

  .pagination-container{
    margin-top: 0;
  }
</style>
