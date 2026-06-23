import { filterAvailableForDependency, RepeatPeriod, Todo, type Todo as TodoType } from "@repo/core"
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker"
import { Picker } from "@react-native-picker/picker"
import { format, parse, isValid } from "date-fns"
import { forwardRef, useImperativeHandle, useState } from "react"
import { Platform, Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native"
import { useProjectSelectors, useTodoActions, useTodoSelectors } from "../store"

const DATE_FORMAT = "dd.MM.yyyy"
const REPEAT_OPTIONS = Object.values(RepeatPeriod)

interface EditTodoFormProps {
  todo: TodoType
  onSave: () => void
}

function parseDate(value: string): Date | undefined {
  if (!value) return undefined
  const d = parse(value, DATE_FORMAT, new Date())
  return isValid(d) ? d : undefined
}

function formatDate(date: Date | undefined): string {
  if (!date) return ""
  return format(date, DATE_FORMAT)
}

function parseTime(value: string): Date | undefined {
  if (!value) return undefined
  const [h, m] = value.split(":").map(Number)
  const d = new Date()
  d.setHours(h || 0, m || 0, 0, 0)
  return d
}

function formatTime(date: Date | undefined): string {
  if (!date) return ""
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
}

export const EditTodoForm = forwardRef<{ save: () => void }, EditTodoFormProps>(
  function EditTodoForm({ todo, onSave }, ref) {
  const { editItemById } = useTodoActions()
  const { projects } = useProjectSelectors()
  const { todos } = useTodoSelectors()
  const otherTodos = filterAvailableForDependency(todos, todo.id)

  const [title, setTitle] = useState(todo.title)
  const [description, setDescription] = useState(todo.description)
  const [tags, setTags] = useState(todo.tags.join(", "))
  const [priority, setPriority] = useState(todo.priority)
  const [date, setDate] = useState(todo.date)
  const [time, setTime] = useState(todo.time)
  const [endDate, setEndDate] = useState(todo.endDate)
  const [repeat, setRepeat] = useState(todo.repeat)
  const [projectId, setProjectId] = useState(todo.projectId)
  const [dependsOn, setDependsOn] = useState<string[]>(todo.dependsOn)

  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [showEndDatePicker, setShowEndDatePicker] = useState(false)

  useImperativeHandle(ref, () => ({ save: handleSave }))

  function handleSave() {
    editItemById(
      todo.id,
      new Todo({
        ...todo,
        title,
        description,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        priority,
        date,
        time,
        endDate,
        repeat,
        projectId,
        dependsOn,
      }),
    )
    onSave()
  }

  function toggleDependsOn(id: string) {
    setDependsOn((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id],
    )
  }

  function onDateChange(event: DateTimePickerEvent, selectedDate?: Date) {
    setShowDatePicker(false)
    if (event.type === "set" && selectedDate) {
      setDate(formatDate(selectedDate))
    }
  }

  function onTimeChange(event: DateTimePickerEvent, selectedDate?: Date) {
    setShowTimePicker(false)
    if (event.type === "set" && selectedDate) {
      setTime(formatTime(selectedDate))
    }
  }

  function onEndDateChange(event: DateTimePickerEvent, selectedDate?: Date) {
    setShowEndDatePicker(false)
    if (event.type === "set" && selectedDate) {
      setEndDate(formatDate(selectedDate))
    }
  }

  return (
    <ScrollView className="flex-1 px-4" keyboardShouldPersistTaps="handled">
      <Text className="text-gray-500 text-xs uppercase font-medium mb-1 mt-4">Title</Text>
      <TextInput
        className="border border-gray-300 rounded-lg px-3 py-2.5 text-base text-gray-900"
        value={title}
        onChangeText={setTitle}
        placeholder="Title"
      />

      <Text className="text-gray-500 text-xs uppercase font-medium mb-1 mt-4">Description</Text>
      <TextInput
        className="border border-gray-300 rounded-lg px-3 py-2.5 text-base text-gray-900"
        value={description}
        onChangeText={setDescription}
        placeholder="Description"
        multiline
        numberOfLines={3}
      />

      <Text className="text-gray-500 text-xs uppercase font-medium mb-1 mt-4">Tags</Text>
      <TextInput
        className="border border-gray-300 rounded-lg px-3 py-2.5 text-base text-gray-900"
        value={tags}
        onChangeText={setTags}
        placeholder="tag1, tag2, tag3"
      />

      <View className="flex-row items-center justify-between mt-4">
        <Text className="text-gray-500 text-xs uppercase font-medium flex-1">Priority</Text>
        <Switch value={priority} onValueChange={setPriority} />
      </View>

      <View className="flex-row gap-3 mt-4">
        <View className="flex-1">
          <Text className="text-gray-500 text-xs uppercase font-medium mb-1">Date</Text>
          <Pressable
            onPress={() => setShowDatePicker(true)}
            className="border border-gray-300 rounded-lg px-3 py-2.5"
          >
            <Text className={date ? "text-gray-900 text-base" : "text-gray-400 text-base"}>
              {date || "Select date"}
            </Text>
          </Pressable>
          {showDatePicker && (
            <DateTimePicker
              value={parseDate(date) || new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "inline" : "default"}
              onChange={onDateChange}
            />
          )}
        </View>
        <View className="flex-1">
          <Text className="text-gray-500 text-xs uppercase font-medium mb-1">Time</Text>
          <Pressable
            onPress={() => setShowTimePicker(true)}
            className="border border-gray-300 rounded-lg px-3 py-2.5"
          >
            <Text className={time ? "text-gray-900 text-base" : "text-gray-400 text-base"}>
              {time || "Select time"}
            </Text>
          </Pressable>
          {showTimePicker && (
            <DateTimePicker
              value={parseTime(time) || new Date()}
              mode="time"
              display={Platform.OS === "ios" ? "inline" : "default"}
              onChange={onTimeChange}
            />
          )}
        </View>
      </View>

      <Text className="text-gray-500 text-xs uppercase font-medium mb-1 mt-4">End date</Text>
      <Pressable
        onPress={() => setShowEndDatePicker(true)}
        className="border border-gray-300 rounded-lg px-3 py-2.5"
      >
        <Text className={endDate ? "text-gray-900 text-base" : "text-gray-400 text-base"}>
          {endDate || "Select end date"}
        </Text>
      </Pressable>
      {showEndDatePicker && (
        <DateTimePicker
          value={parseDate(endDate) || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={onEndDateChange}
        />
      )}

      <Text className="text-gray-500 text-xs uppercase font-medium mb-1 mt-4">Repeat</Text>
      <View className="border border-gray-300 rounded-lg">
        <Picker selectedValue={repeat ?? ""} onValueChange={(v) => setRepeat((v || undefined) as RepeatPeriod | undefined)}>
          <Picker.Item label="No repeat" value="" />
          {REPEAT_OPTIONS.map((opt) => (
            <Picker.Item key={opt} label={opt} value={opt} />
          ))}
        </Picker>
      </View>

      <Text className="text-gray-500 text-xs uppercase font-medium mb-1 mt-4">Project</Text>
      <View className="border border-gray-300 rounded-lg">
        <Picker selectedValue={projectId} onValueChange={setProjectId}>
          <Picker.Item label="No project" value="" />
          {projects.map((p) => (
            <Picker.Item key={p.id} label={p.name} value={p.id} />
          ))}
        </Picker>
      </View>

      {otherTodos.length > 0 && (
        <>
          <Text className="text-gray-500 text-xs uppercase font-medium mb-1 mt-4">Depends on</Text>
          {otherTodos.map((t) => {
            const checked = dependsOn.includes(t.id)
            return (
              <Pressable
                key={t.id}
                onPress={() => toggleDependsOn(t.id)}
                className="flex-row items-center py-2"
              >
                <View
                  style={{
                    width: 18, height: 18, borderRadius: 4, borderWidth: 2,
                    borderColor: checked ? "#6366f1" : "#d1d5db",
                    backgroundColor: checked ? "#6366f1" : "transparent",
                    alignItems: "center", justifyContent: "center", marginRight: 8,
                  }}
                >
                  {checked && <Text style={{ color: "white", fontSize: 11, fontWeight: "700" }}>✓</Text>}
                </View>
                <Text className="text-gray-900 text-sm flex-1">{t.title}</Text>
              </Pressable>
            )
          })}
        </>
      )}

      <View className="h-16" />
    </ScrollView>
  )
})
