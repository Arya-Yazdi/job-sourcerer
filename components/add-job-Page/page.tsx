import {
  addJobFormSchema,
  employmentTypeList,
  jobStatus,
  payTypeList
} from '@/utils/db/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { saveJobData } from '@/utils/db/saveJobData';
import { toast } from 'sonner';

export function AddJobForm() {
  const form = useForm<z.infer<typeof addJobFormSchema>>({
    resolver: zodResolver(addJobFormSchema),
    defaultValues: {
      companyName: '',
      link: '',
      companyLogoUrl: '',
      title: '',
      description: '',
      intern: false,
      location: '',
      remote: false,
      payrate: undefined,
      status: jobStatus[7],
    },
  });

  async function onSubmit(values: z.infer<typeof addJobFormSchema>) {
    const saved = await saveJobData(values);
    if (saved) {
      toast.success('Job saved successfully!');
      form.reset();
    } else {
      toast.error('Could not save job. Try again.');
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='space-y-8 p-4 px-17'
      >
        <div className='w-full grid grid-cols-2 gap-8'>
          <div className='w-full grid grid-cols-2 gap-8'>
            <FormField
              control={form.control}
              name='companyName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='companyLogoUrl'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Logo URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder=''
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className='w-full grid grid-cols-2 gap-8'>
          <div className='w-full grid grid-cols-2 gap-8'>
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='link'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Posting URL</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className='w-full grid grid-cols-2 gap-8'>
          <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Description</FormLabel>
                <FormControl>
                  <Textarea rows={4} placeholder='' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className='w-full grid grid-cols-2 gap-8'>
          <div className='w-full grid grid-cols-4 gap-24'>
            <FormField
              control={form.control}
              name='intern'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Internship</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='remote'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remote</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className='w-full grid grid-cols-2 gap-8'>
          <div className='w-full grid grid-cols-2 gap-8'>
            <FormField
              control={form.control}
              name='employmentType'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employment Type</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ''}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select employment type' />
                      </SelectTrigger>
                      <SelectContent>
                        {employmentTypeList.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='location'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Location</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className='w-full grid grid-cols-4 gap-8'>
          <div className='w-full grid grid-cols-2 gap-8'>
            <FormField
              control={form.control}
              name='payrate'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pay (USD)</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      step='0.01'
                      placeholder='50000'
                      value={
                        field.value != null
                          ? (field.value / 100).toString()
                          : ''
                      }
                      onChange={(e) => {
                        const amount = e.target.valueAsNumber;
                        // Store pay as cents
                        field.onChange(
                          Number.isNaN(amount)
                            ? undefined
                            : Math.round(amount * 100)
                        );
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='payType'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ''}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='' />
                      </SelectTrigger>
                      <SelectContent>
                        {payTypeList.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className='w-full grid grid-cols-1 gap-8'>
            <FormField
              control={form.control}
              name='status'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Application Status</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? jobStatus[7]}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select application status' />
                      </SelectTrigger>
                      <SelectContent>
                        {jobStatus.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <Button type='submit'>Submit</Button>
      </form>
    </Form>
  );
}

export function AddJobPage() {
  return (
    <div className='w-full'>
      <AddJobForm />
    </div>
  );
}
